const prisma = require('../../config/prisma');

async function findSiteByApiKey(apiKey) {
    return prisma.site.findUnique({
        where: {apiKey},
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