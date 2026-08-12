const prisma = require('../../config/prisma');

async function findSiteByApiKey(apiKey) {
    return prisma.site.findUnique({
        where: {apiKey},
        select: {
            id: true, userId: true,
            // Carried along so recordEvent can resolve the owner's plan
            // without a second round trip — this whole result gets cached
            // in Redis for CACHE_TTL_SECONDS (see ingest.cache.js), so a
            // plan change here can take up to that long to reach ingest
            // enforcement unless something explicitly invalidates the
            // cache (admin.service.js's plan update does).
            user: {select: {subscription: {select: {plan: true, currentPeriodEnd: true}}}},
        },
    })
}

async function createManyEvents(events) {
    return prisma.event.createMany({
        data: events,
    })
}

module.exports = {
    findSiteByApiKey, createManyEvents
}