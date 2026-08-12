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

    // Page views and product clicks both count against the same monthly
    // quota ("events"), matching what's advertised on the pricing page.
    // Skipped entirely for unlimited plans — no reason to pay a Redis round
    // trip enforcing a cap that can never be hit.
    const plan = resolveEffectivePlan(site.user?.subscription);
    const {maxMonthlyEvents} = PLAN_LIMITS[plan] || PLAN_LIMITS.Free;
    if (maxMonthlyEvents !== Infinity) {
        const eventsThisMonth = await incrementMonthlyEventCount(site.id);
        if (eventsThisMonth > maxMonthlyEvents) {
            throw new AppError(
                `Monthly event limit reached for the ${plan} plan. Upgrade to keep tracking.`,
                402,
            );
        }
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