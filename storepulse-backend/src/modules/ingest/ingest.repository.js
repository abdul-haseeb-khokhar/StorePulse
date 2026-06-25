const prisma = require('../../config/prisma');

async function findSiteByApiKey(apiKey) {
    console.log("FindSiteByAPIKey repository function is called")
    return prisma.site.findUnique({
        where: {apiKey},
    })
}

async function createManyEvents(events) {
    console.log("CreateManyevents repository is called")
    return prisma.event.createMany({
        data: events,
    })
}

module.exports = {
    findSiteByApiKey, createManyEvents
}