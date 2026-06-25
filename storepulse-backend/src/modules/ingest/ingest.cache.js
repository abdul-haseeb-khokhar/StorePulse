const CACHE_TTL_MS = 10 * 60 * 1000;

const siteCache = new Map();

function getCachedSite(apiKey) {
    const entry = siteCache.get(apiKey);

    if(! entry) return null;

    const isExpired = Date.now() - entry.cachedAt > CACHE_TTL_MS;

    if(isExpired) {
        siteCache.delete(apiKey);
        return null;
    }

    return entry.site;
}

function setCachedSite (apiKey, site) {
    siteCache.set(apiKey, {site, cachedAt: Date.now()})
}

function invalidateCachedSite(apiKey) {
    siteCache.delete(apiKey)
}

module.exports = {
    getCachedSite, setCachedSite, invalidateCachedSite
}