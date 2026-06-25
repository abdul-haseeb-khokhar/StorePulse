const {createSite, findSiteById, findSitesByUserId, updateApiKey} = require('./sites.repository')
const {generateApiKey} = require('../../utils/apiKey')
const AppError = require('../../utils/AppError')
const {invalidateCachedSite} = require('../ingest/ingest.cache')

async function addSite({name, domain, userId}) {
    const apiKey = generateApiKey();

    const site = await createSite({name, domain, apiKey, userId})

    return site;
}

async function getUserSites(userId) {
    return findSitesByUserId(userId)
}

async function getSiteById({siteId, userId}) {
    console.log('Get site by id service is runnig')
    const site = await findSiteById(siteId);

    if(!site) throw new AppError('Site not found.', 404);

    if (site.userId !== userId) throw new AppError('You do not have access to this site.', 403);

    return site;
}

async function regenerateApiKey({siteId, userId}) {
    console.log('Regenerate Api key service is runnig')
    
    const site = await getSiteById({siteId, userId});

    const newApiKey = generateApiKey()

    invalidateCachedSite(site.apiKey);

    return updateApiKey(siteId, newApiKey);
}

module.exports = {
    addSite, getUserSites, regenerateApiKey, getSiteById
}