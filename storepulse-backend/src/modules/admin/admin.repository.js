const prisma = require('../../config/prisma');

async function updateUserStatus(userId, dataToBeUpdated) {
    return prisma.user.update({
        where: {id: userId},
        data: dataToBeUpdated,
        select: {id: true, fullName: true, email: true, createdAt: true, status: true,
            sites: {select: {id: true, name: true, domain: true, createdAt: true}}
        }
    });
}

async function listUsers({skip, take, search, status}) {
    const where = {
        ...(status ? {status} : {}),
        ...(search ? {
            OR: [
                {fullName: {contains: search, mode: 'insensitive'}},
                {email: {contains: search, mode: 'insensitive'}},
            ]
        } : {}),
    };

    const [users, total] = await Promise.all([
        prisma.user.findMany({
            where, skip, take, orderBy: {createdAt: 'desc'},
            select: {id: true, fullName: true, email: true, status: true, isEmailVerified: true, createdAt: true}
        }),
        prisma.user.count({where}),
    ]);

    return {users, total};
}

async function findUserByIdWithSites(userId) {
    return prisma.user.findUnique({
        where: {id: userId},
        select: {id: true, fullName: true, email: true, status: true, isEmailVerified: true, createdAt: true,
            sites: {select: {id: true, name: true, domain: true, createdAt: true}}
        }
    });
}

async function listSites({skip, take, search}) {
    const where = search ? {
        OR: [
            {name: {contains: search, mode: 'insensitive'}},
            {domain: {contains: search, mode: 'insensitive'}},
        ]
    } : {};

    const [sites, total] = await Promise.all([
        prisma.site.findMany({
            where, skip, take, orderBy: {createdAt: 'desc'},
            select: {id: true, name: true, domain: true, createdAt: true,
                user: {select: {id: true, fullName: true, email: true}}
            }
        }),
        prisma.site.count({where}),
    ]);

    return {sites, total};
}

async function getPlatformStats() {
    const [totalUsers, activeUsers, bannedUsers, totalSites, totalEvents, newUsersLast7Days] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({where: {status: 'Active'}}),
        prisma.user.count({where: {status: 'Banned'}}),
        prisma.site.count(),
        prisma.event.count(),
        prisma.user.count({where: {createdAt: {gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)}}}),
    ]);

    return {totalUsers, activeUsers, bannedUsers, totalSites, totalEvents, newUsersLast7Days};
}

async function createAdminLog({adminId, action, targetedUserId}) {
    return prisma.adminLog.create({
        data: {adminId, action, targetedUserId}
    });
}

module.exports = {
    updateUserStatus, listUsers, findUserByIdWithSites, listSites, getPlatformStats, createAdminLog
}
