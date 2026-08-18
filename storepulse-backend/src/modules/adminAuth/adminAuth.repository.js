/**
 * Prisma queries backing admin authentication and invite management.
 */
const prisma = require('../../config/prisma');

async function findAdminByEmail(email) {
    return prisma.admin.findUnique({
        where: {email}
    });
}

async function findAdminById(id) {
    return prisma.admin.findUnique({
        where: {id}
    });
}

/** Creates a pending (not-yet-activated) admin row with an invite token. */
async function createAdminInvite({email, hashedToken, expiry}) {
    return prisma.admin.create({
        data: {
            email,
            inviteToken: hashedToken,
            inviteTokenExpiry: expiry,
        }
    });
}

/** Refreshes an existing pending invite's token/expiry, for resends. */
async function updateAdminInvite(adminId, {hashedToken, expiry}) {
    return prisma.admin.update({
        where: {id: adminId},
        data: {
            inviteToken: hashedToken,
            inviteTokenExpiry: expiry,
        }
    });
}

async function findAdminByInviteToken(hashedToken) {
    return prisma.admin.findFirst({
        where: {inviteToken: hashedToken}
    });
}

/** Turns a pending invite into a real, usable admin account. */
async function activateAdmin(adminId, {fullName, hashedPassword}) {
    return prisma.admin.update({
        where: {id: adminId},
        data: {
            fullName,
            password: hashedPassword,
            isActive: true,
            inviteToken: null,
            inviteTokenExpiry: null,
        }
    });
}

async function listAdmins() {
    return prisma.admin.findMany({
        orderBy: {createdAt: 'desc'},
        select: {id: true, fullName: true, email: true, role: true, isActive: true, createdAt: true}
    });
}

module.exports = {
    findAdminByEmail, findAdminById, createAdminInvite, updateAdminInvite, findAdminByInviteToken, activateAdmin, listAdmins
}
