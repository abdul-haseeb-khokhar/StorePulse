/**
 * Business logic for the sites module. "Active" is never stored — it's
 * recomputed live from a site's fixed creation rank against whatever the
 * owner's current plan allows, so a plan change instantly changes which
 * sites are active with no migration needed on the Site table.
 */
const {
    createSiteIfUnderLimit, findSiteById, findSitesByUserId, updateApiKey, findUserPlan, countSitesCreatedUpTo,
    findSiteByPublicToken, updatePublicAccess, setPublicAccess,
} = require('./sites.repository')
const {generateApiKey, generatePublicToken} = require('../../utils/apiKey')
const AppError = require('../../utils/AppError')
const {invalidateCachedSite} = require('../ingest/ingest.cache')
const {getMonthlyEventCount} = require('../ingest/ingest.usage')
const {PLAN_LIMITS} = require('../../config/plans')

/**
 * Sites are never deleted or reordered, so "active" is entirely a function
 * of a fixed creation-order rank vs. whatever the CURRENT plan allows —
 * recomputed live here rather than stored, the same way resolveEffectivePlan
 * treats plan expiry: a downgrade locks the newest sites out immediately,
 * and an upgrade (or a lapsed plan's renewal) brings them back the instant
 * it's read, with no flag to flip and no migration on that Site row.
 */
function annotateActiveSites(sites, maxSites) {
    if (maxSites === Infinity) return sites.map((site) => ({...site, active: true}));

    // Same tie-break as countSitesCreatedUpTo (createdAt, then id) so this
    // in-memory ranking and that DB-query-based one can never disagree on
    // which site holds a given rank, even for two sites created in the same
    // millisecond.
    const activeIds = new Set(
        [...sites]
            .sort((a, b) => a.createdAt - b.createdAt || a.id.localeCompare(b.id))
            .slice(0, maxSites)
            .map((site) => site.id)
    );
    return sites.map((site) => ({...site, active: activeIds.has(site.id)}));
}

/**
 * A plan change that lowers maxSites can silently push some already-created
 * sites out of the active ranking — annotateActiveSites already recomputes
 * that live on every getUserSites() read, so the sites themselves need no
 * write here. This just diffs that same ranking across the old and new
 * plan so the caller (subscription.service.js, admin.service.js) knows
 * exactly which sites just flipped, in order to tell the user about it.
 * Returns [] for a same-or-higher maxSites change — nothing can newly
 * deactivate by gaining room, only by losing it.
 */
function getNewlyDeactivatedSites(sites, oldPlan, newPlan) {
    const oldMax = (PLAN_LIMITS[oldPlan] || PLAN_LIMITS.Free).maxSites;
    const newMax = (PLAN_LIMITS[newPlan] || PLAN_LIMITS.Free).maxSites;
    if (newMax >= oldMax) return [];

    const wasActiveIds = new Set(
        annotateActiveSites(sites, oldMax).filter((site) => site.active).map((site) => site.id)
    );
    const isStillActiveIds = new Set(
        annotateActiveSites(sites, newMax).filter((site) => site.active).map((site) => site.id)
    );

    return sites.filter((site) => wasActiveIds.has(site.id) && !isStillActiveIds.has(site.id));
}

async function isSiteActive(site, plan) {
    const {maxSites} = PLAN_LIMITS[plan] || PLAN_LIMITS.Free;
    if (maxSites === Infinity) return true;

    const rank = await countSitesCreatedUpTo(site.userId, site.createdAt, site.id);
    return rank <= maxSites;
}

/** Creates a site, rejecting if the owner's plan is already at its site limit. */
async function addSite({name, domain, userId}) {
    const plan = await findUserPlan(userId);
    const {maxSites} = PLAN_LIMITS[plan] || PLAN_LIMITS.Free;

    const apiKey = generateApiKey();

    // Count-then-create happens inside one row-locked transaction (see
    // sites.repository.js) so two concurrent requests can't both slip in
    // under the limit.
    const {site, limitExceeded} = await createSiteIfUnderLimit({name, domain, apiKey, userId, maxSites});
    if (limitExceeded) {
        throw new AppError(`Your ${plan} plan allows up to ${maxSites} site(s). Upgrade to add more.`, 403);
    }

    return site;
}

/** All of a user's sites, each annotated with whether it's currently active under their plan. */
async function getUserSites(userId) {
    const [sites, plan] = await Promise.all([findSitesByUserId(userId), findUserPlan(userId)]);
    const {maxSites} = PLAN_LIMITS[plan] || PLAN_LIMITS.Free;

    return annotateActiveSites(sites, maxSites);
}

/**
 * Per-site monthly event usage against the plan's quota. Per-site, not a
 * single account-wide number — the quota itself is enforced per site (see
 * ingest.service.js), so a combined total here would misrepresent what's
 * actually being checked against the cap.
 */
async function getUsageSummary(userId) {
    const plan = await findUserPlan(userId);
    const {maxMonthlyEvents} = PLAN_LIMITS[plan] || PLAN_LIMITS.Free;
    const sites = await findSitesByUserId(userId);

    const sitesUsage = await Promise.all(
        sites.map(async (site) => ({
            siteId: site.id,
            name: site.name,
            domain: site.domain,
            eventsThisMonth: await getMonthlyEventCount(site.id),
        }))
    );

    // JSON has no Infinity — it silently serializes to null, so this makes
    // "unlimited" an explicit, intentional part of the response shape
    // instead of relying on that implicit conversion happening to work.
    return {
        plan,
        maxMonthlyEvents: maxMonthlyEvents === Infinity ? null : maxMonthlyEvents,
        sites: sitesUsage,
    };
}

/** A single site, after confirming it exists and belongs to the requesting user. */
async function getSiteById({siteId, userId}) {
    // findUserPlan doesn't depend on the site row (only userId, already
    // known), so it runs alongside findSiteById instead of waiting on it —
    // this is called 4x in parallel per dashboard load (once per analytics
    // endpoint), so cutting even one round trip off each matters here.
    const [site, plan] = await Promise.all([findSiteById(siteId), findUserPlan(userId)]);

    if(!site) throw new AppError('Site not found.', 404);

    if (site.userId !== userId) throw new AppError('You do not have access to this site.', 403);

    return {...site, active: await isSiteActive(site, plan)};
}

/** Revokes a site's current API key and issues a new one. */
async function regenerateApiKey({siteId, userId}) {
    const site = await getSiteById({siteId, userId});

    const newApiKey = generateApiKey()

    // DB write happens first: if an ingest event for the old key lands
    // right after this, the DB already rejects it as unknown instead of
    // re-caching it. Doing it the other way around (cache-clear first)
    // leaves a window where a still-valid-in-DB old key gets re-cached for
    // a fresh 30-minute TTL, undoing the whole point of "revoke this key".
    const updatedSite = await updateApiKey(siteId, newApiKey);

    await invalidateCachedSite(site.apiKey);

    return updatedSite;
}

/**
 * Enables or disables the public, no-auth dashboard link for a site. The
 * first time it's turned on, a token is minted; later toggles reuse
 * whatever token already exists, so switching it back on hands out the
 * same link rather than a different one — see SiteSettings.jsx's "Turn
 * off" copy, which spells this out for the owner ("Regenerate" is the
 * separate, explicit action for actually invalidating a leaked link). The
 * ownership check and the actual flip are two separate steps (own-check
 * here, the read-token-then-write itself made atomic in setPublicAccess)
 * rather than one combined query, since only the second half has the race
 * that needs locking.
 */
async function setPublicDashboardEnabled({siteId, userId, enabled}) {
    await getSiteById({siteId, userId});

    return setPublicAccess(siteId, enabled);
}

/** Revokes the current public link and issues a new one, independent of the ingest API key. */
async function regeneratePublicToken({siteId, userId}) {
    await getSiteById({siteId, userId});

    return updatePublicAccess(siteId, {publicToken: generatePublicToken()});
}

/**
 * Resolves a site from its public share token for the no-auth dashboard
 * routes. Not-found, turned-off, and plan-inactive all fail identically —
 * an anonymous visitor shouldn't be able to tell "bad link" apart from
 * "the owner disabled sharing" or "the owner's plan lapsed," any of which
 * would otherwise leak information about an account that isn't theirs.
 * Unlike getSiteById, there's no legitimate reason for a public caller to
 * ever see an inactive site, so that check lives here instead of being
 * left to each caller (contrast analytics.service.js's assertSiteActive,
 * which the owner-facing path does need as a separate step — see
 * SiteSettings.jsx, which shows a locked site's settings even when its
 * analytics are blocked).
 */
async function getSiteByPublicToken(token) {
    const site = await findSiteByPublicToken(token);
    if (!site || !site.publicDashboardEnabled) {
        throw new AppError('This dashboard link is no longer available.', 404);
    }

    const plan = await findUserPlan(site.userId);
    if (!(await isSiteActive(site, plan))) {
        throw new AppError('This dashboard link is no longer available.', 404);
    }

    return site;
}

module.exports = {
    addSite, getUserSites, regenerateApiKey, getSiteById, getUsageSummary, getNewlyDeactivatedSites,
    setPublicDashboardEnabled, regeneratePublicToken, getSiteByPublicToken,
}
