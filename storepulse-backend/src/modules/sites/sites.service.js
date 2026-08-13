const {createSiteIfUnderLimit, findSiteById, findSitesByUserId, updateApiKey, findUserPlan} = require('./sites.repository')
const {generateApiKey} = require('../../utils/apiKey')
const AppError = require('../../utils/AppError')
const {invalidateCachedSite} = require('../ingest/ingest.cache')
const {getMonthlyEventCount} = require('../ingest/ingest.usage')
const {PLAN_LIMITS} = require('../../config/plans')

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

async function getUserSites(userId) {
    return findSitesByUserId(userId)
}

// Per-site, not a single account-wide number — the quota itself is
// enforced per site (see ingest.service.js), so a combined total here
// would misrepresent what's actually being checked against the cap.
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

async function getSiteById({siteId, userId}) {
    const site = await findSiteById(siteId);

    if(!site) throw new AppError('Site not found.', 404);

    if (site.userId !== userId) throw new AppError('You do not have access to this site.', 403);

    return site;
}

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

module.exports = {
    addSite, getUserSites, regenerateApiKey, getSiteById, getUsageSummary
}