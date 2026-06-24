const prisma = require('../../config/prisma')

async function createSite({name, domain, apiKey, userId}) {
    return prisma.site.create({
        data: {name, domain, apiKey, userId}
    })
}

async function findSitesByUserId(userId) {
    return prisma.site.findMany({
        where: {userId},
        orderBy: {createdAt: 'desc'}
    });
}

async function findSiteById(id) {
    return prisma.site.findUnique({
        where:{id}
    })
}

async function updateApiKey(id, newApiKey) {
    return prisma.site.update({
        where:{id},
        data: {apiKey: newApiKey}
    })
}

module.exports = {
    createSite, findSiteById, findSitesByUserId, updateApiKey
}