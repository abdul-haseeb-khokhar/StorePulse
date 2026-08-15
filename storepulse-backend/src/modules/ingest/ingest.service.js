const {findSiteByApiKey} = require('./ingest.repository');
const {addToBuffer} = require('./ingest.buffer');
const {incrementMonthlyEventCount} = require('./ingest.usage');
const AppError = require('../../utils/AppError');
const {getCachedSite, setCachedSite} = require('./ingest.cache')
const {PLAN_LIMITS, resolveEffectivePlan} = require('../../config/plans')

function extractDomain(referrerUrl) {
    if(!referrerUrl) return 'direct';

    try {
        return new URL(referrerUrl).hostname.replace(/^www\./, '');
    } catch {
        return 'direct';
    }
}

async function recordEvent({apiKey, type, pageUrl, referrer, productId, productName, visitorId}) {
    let site =await getCachedSite(apiKey);
    if(!site){
        site = await findSiteByApiKey(apiKey);
        if(!site) {
            throw new AppError('Invalid API key', 401)
        }
        await setCachedSite(apiKey, site)
    }

    // A banned/deleted account's sites shouldn't keep collecting events (or
    // consuming their plan's quota) just because the API key is still
    // technically valid — admin.service.js's status update invalidates the
    // cache for exactly this reason. Kept deliberately vague to whoever's
    // holding the key: it doesn't say *why* the site was cut off.
    if (site.user?.status === 'Banned' || site.user?.status === 'Deleted') {
        throw new AppError('This site is not currently accepting events.', 403);
    }

    const plan = resolveEffectivePlan(site.user?.subscription);
    const {maxSites, maxMonthlyEvents} = PLAN_LIMITS[plan] || PLAN_LIMITS.Free;

    // Sites are never deleted or reordered — one added while on a higher
    // plan keeps existing after a downgrade, but stops accepting events
    // once its fixed creation-rank (see ingest.repository.js) no longer
    // fits the current plan's maxSites. Same vague message as the
    // banned/deleted check above: whoever's holding the key doesn't need
    // to know *why* a site was cut off, just that it was.
    if (maxSites !== Infinity && site.rank > maxSites) {
        throw new AppError('This site is not currently accepting events.', 403);
    }

    // Page views and product clicks both count against the same monthly
    // quota ("events"), matching what's advertised on the pricing page.
    // Counted for every plan, including unlimited ones — sites.service.js's
    // getUsageSummary reads this same counter to show "events this month"
    // on the user's own dashboard, so skipping the increment for Business
    // would leave that number stuck at 0 even though tracking works fine.
    // Only the cap check itself is skipped for unlimited plans.
    const eventsThisMonth = await incrementMonthlyEventCount(site.id);
    if (maxMonthlyEvents !== Infinity && eventsThisMonth > maxMonthlyEvents) {
        throw new AppError(
            `Monthly event limit reached for the ${plan} plan. Upgrade to keep tracking.`,
            402,
        );
    }

    await addToBuffer({
        type,
        pageUrl, 
        referrer: type === 'PAGE_VIEW' ? extractDomain(referrer) : null, 
        productId: productId || null, 
        productName: productName || null, 
        visitorId,
        siteId: site.id,
        createdAt: new Date(),
    });
}
module.exports = {
    recordEvent,
}