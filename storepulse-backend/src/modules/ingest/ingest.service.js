const {findSiteByApiKey} = require('./ingest.repository');
const {addToBuffer} = require('./ingest.buffer');
const AppError = require('../../utils/AppError');
const {getCachedSite, setCachedSite} = require('./ingest.cache')
const VALID_EVENTS_TYPES = ['PAGE_VIEW', 'PRODUCT_CLICK'];

async function recordEvent({apiKey, type, pageUrl, referrer, productId, productName, visitorId}) {
    if(!apiKey) {
        throw new AppError('Missing API key.', 401);
    }
    if(!VALID_EVENTS_TYPES.includes(type)){
        throw new AppError('Invalid event type.', 400);
    } 
    if(!pageUrl){
        throw new AppError("Missing pageUrl.", 400);
    }
    if(!visitorId) {
        throw new AppError('Missing visitorId.', 400)
    } 

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
        referrer: referrer || null, 
        productId: productId || null, 
        productName: productName || null, 
        visitorId,
        siteId: site.id,
    });
}
module.exports = {
    recordEvent,
}