const prisma = require('../../config/prisma');

const NOTIFICATION_SELECT = {id: true, type: true, message: true, link: true, read: true, createdAt: true};

async function createNotification({type, message, link, userId}) {
    return prisma.notification.create({
        data: {type, message, link, userId},
        select: NOTIFICATION_SELECT,
    });
}

async function listByUser(userId, {skip = 0, take = 20} = {}) {
    const where = {userId};
    const [notifications, total] = await Promise.all([
        prisma.notification.findMany({where, skip, take, orderBy: {createdAt: 'desc'}, select: NOTIFICATION_SELECT}),
        prisma.notification.count({where}),
    ]);
    return {notifications, total};
}

async function countUnreadByUser(userId) {
    return prisma.notification.count({where: {userId, read: false}});
}

// Scoped by userId, not just the notification id — so one user can never
// mark another user's notification as read just by guessing/incrementing
// an id. updateMany + count rather than update, since update throws
// (P2025) on a no-match instead of quietly telling the caller nothing
// happened.
async function markReadForUser(id, userId) {
    const {count} = await prisma.notification.updateMany({where: {id, userId}, data: {read: true}});
    return count > 0;
}

async function markAllReadForUser(userId) {
    return prisma.notification.updateMany({where: {userId, read: false}, data: {read: true}});
}

module.exports = {createNotification, listByUser, countUnreadByUser, markReadForUser, markAllReadForUser};
