/**
 * Redis cache for the per-site lookup ingest.service.js needs on every
 * event (owner status, plan, site rank), so a hot site doesn't hit Postgres
 * on every single tracked event.
 */
const redisClient = require('../../config/redis');

const CACHE_TTL_SECONDS = 30 * 60;
// Bumped from "site:" when `rank` was added to the cached shape (see
// ingest.repository.js's findSiteByApiKey) — the 30-minute TTL means a
// deploy can otherwise leave old-shape entries live for up to that long,
// and a missing `rank` field silently fails the new maxSites check open
// (`undefined > maxSites` is false), not closed. Namespacing the key by
// shape version means old entries are simply never read by the new code
// instead of being trusted as if they still matched it; bump this again
// any time the cached site object's shape changes.
const KEY_PREFIX = 'site:v2:';

async function getCachedSite(apiKey) {
    const site = await redisClient.get(`${KEY_PREFIX}${apiKey}`);

    if(!site) return null;

    return JSON.parse(site);
}

async function setCachedSite (apiKey, site) {
    await redisClient.set(
        `${KEY_PREFIX}${apiKey}`,
        JSON.stringify(site),
        'EX',
        CACHE_TTL_SECONDS
    );
}

/** Forces the next lookup for this key to hit Postgres. Called wherever a site's status, plan, or rank could have changed. */
async function invalidateCachedSite(apiKey) {
    await redisClient.del(`${KEY_PREFIX}${apiKey}`)
}

module.exports = {
    getCachedSite, setCachedSite, invalidateCachedSite
}
