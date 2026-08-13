const prisma = require('../../config/prisma');

const REQUEST_SELECT = {
    id: true, userId: true, plan: true, billingCycle: true, status: true,
    note: true, createdAt: true, reviewedAt: true, reviewedBy: true, reviewNote: true,
};

async function createPaymentRequest({userId, plan, billingCycle, note}) {
    return prisma.paymentRequest.create({
        data: {userId, plan, billingCycle, note},
        select: REQUEST_SELECT,
    });
}

async function findPendingRequestByUserId(userId) {
    return prisma.paymentRequest.findFirst({
        where: {userId, status: 'Pending'},
        orderBy: {createdAt: 'desc'},
        select: REQUEST_SELECT,
    });
}

async function listRequestsByUserId(userId, {skip = 0, take = 20} = {}) {
    const [requests, total] = await Promise.all([
        prisma.paymentRequest.findMany({
            where: {userId}, skip, take, orderBy: {createdAt: 'desc'}, select: REQUEST_SELECT,
        }),
        prisma.paymentRequest.count({where: {userId}}),
    ]);
    return {requests, total};
}

async function findRequestById(id) {
    return prisma.paymentRequest.findUnique({
        where: {id},
        select: {...REQUEST_SELECT, user: {select: {id: true, fullName: true, email: true}}},
    });
}

// Defaults to Pending-only — that's what the admin queue actually wants to
// see day to day; passing status explicitly (e.g. to review history) opts
// out of that default rather than needing a second function for it.
async function listRequests({skip = 0, take = 20, status = 'Pending'} = {}) {
    const where = status ? {status} : {};
    const [requests, total] = await Promise.all([
        prisma.paymentRequest.findMany({
            where, skip, take, orderBy: {createdAt: 'asc'},
            select: {...REQUEST_SELECT, user: {select: {id: true, fullName: true, email: true}}},
        }),
        prisma.paymentRequest.count({where}),
    ]);
    return {requests, total};
}

async function updateRequestStatus(id, {status, reviewedBy, reviewNote}) {
    return prisma.paymentRequest.update({
        where: {id},
        data: {status, reviewedBy, reviewedAt: new Date(), reviewNote},
        select: REQUEST_SELECT,
    });
}

module.exports = {
    createPaymentRequest, findPendingRequestByUserId, listRequestsByUserId,
    findRequestById, listRequests, updateRequestStatus,
}
