/**
 * Prisma queries backing ingest: the API-key lookup that resolves a site's
 * owner/plan/rank, and the batch insert the buffer flushes into.
 */
const prisma = require('../../config/prisma');
const {countSitesCreatedUpTo} = require('../sites/sites.repository');

/**
 * Resolves a site (with owner status/plan and creation rank) from its API
 * key. This is the object ingest.cache.js caches for CACHE_TTL_SECONDS, so
 * everything it includes is deliberately just what recordEvent needs to
 * enforce access without a second round trip.
 */
async function findSiteByApiKey(apiKey) {
    const site = await prisma.site.findUnique({
        where: {apiKey},
        select: {
            id: true, userId: true, createdAt: true,
            // Carried along so recordEvent can resolve the owner's plan and
            // account status without a second round trip — this whole
            // result gets cached in Redis for CACHE_TTL_SECONDS (see
            // ingest.cache.js), so a plan or status change here can take up
            // to that long to reach ingest enforcement unless something
            // explicitly invalidates the cache (admin.service.js's plan
            // and status updates both do).
            user: {select: {status: true, subscription: {select: {plan: true, currentPeriodEnd: true}}}},
        },
    });
    if (!site) return null;

    // Rank among the owner's sites by creation order — fixed forever (sites
    // are never deleted or reordered), so recordEvent can compare it against
    // whatever the current plan's maxSites allows. Reuses sites.repository.js's
    // countSitesCreatedUpTo rather than a second hand-written copy of this
    // query, so the definition of "rank" can only drift in one place. Same
    // caching tradeoff as the rest of this object: computed fresh on a cache
    // miss, then frozen in Redis until something invalidates it (a plan
    // change) or the TTL expires — a stale-but-still-correct rank, since it
    // never actually changes on its own.
    const rank = await countSitesCreatedUpTo(site.userId, site.createdAt, site.id);

    return {...site, rank};
}

/** Batch-inserts a flushed page of buffered events. */
async function createManyEvents(events) {
    return prisma.event.createMany({
        data: events,
    })
}

module.exports = {
    findSiteByApiKey, createManyEvents
}
