const redisClient = require('../../config/redis');

const CACHE_TTL_SECONDS = 30 * 60;

async function getCachedSite(apiKey) {
    const site = await redisClient.get(`site:${apiKey}`);

    if(!site) return null;

    return JSON.parse(site);
}

async function setCachedSite (apiKey, site) {
    await redisClient.set(
        `site:${apiKey}`,
        JSON.stringify(site),
        'EX',
        CACHE_TTL_SECONDS
    );
}

async function invalidateCachedSite(apiKey) {
    await redisClient.del(`site:${apiKey}`)
}

module.exports = {
    getCachedSite, setCachedSite, invalidateCachedSite
}
