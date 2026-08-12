const {createSite, findSiteById, findSitesByUserId, updateApiKey, findUserPlan} = require('./sites.repository')
const {generateApiKey} = require('../../utils/apiKey')
const AppError = require('../../utils/AppError')
const {invalidateCachedSite} = require('../ingest/ingest.cache')

const PLAN_LIMITS = {
    Free: {maxSites: 1},
    Pro: {maxSites: 5},
    Business: {maxSites: Infinity},
};

async function addSite({name, domain, userId}) {
    const plan = await findUserPlan(userId);
    const {maxSites} = PLAN_LIMITS[plan] || PLAN_LIMITS.Free;

    const existingSites = await findSitesByUserId(userId);
    if (existingSites.length >= maxSites) {
        throw new AppError(`Your ${plan} plan allows up to ${maxSites} site(s). Upgrade to add more.`, 403);
    }

    const apiKey = generateApiKey();

    const site = await createSite({name, domain, apiKey, userId})

    return site;
}

async function getUserSites(userId) {
    return findSitesByUserId(userId)
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
    addSite, getUserSites, regenerateApiKey, getSiteById
}