const {findSiteByApiKey} = require('./ingest.repository');
const {addToBuffer} = require('./ingest.buffer');
const AppError = require('../../utils/AppError');
const {getCachedSite, setCachedSite} = require('./ingest.cache')

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
    await addToBuffer({
        type,
        pageUrl, 
        referrer: type === 'PAGE_VIEW' ? extractDomain(referrer) : null, 
        productId: productId || null, 
        productName: productName || null, 
        visitorId,
        siteId: site.id,
    });
}
module.exports = {
    recordEvent,
}