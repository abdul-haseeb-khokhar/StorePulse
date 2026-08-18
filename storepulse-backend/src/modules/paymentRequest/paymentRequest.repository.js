/**
 * Prisma queries backing manual payment requests: the user-facing submit
 * flow and the admin-facing review queue.
 */
const prisma = require('../../config/prisma');

const REQUEST_SELECT = {
    id: true, userId: true, plan: true, billingCycle: true, status: true,
    note: true, createdAt: true, reviewedAt: true, reviewedBy: true, reviewNote: true,
};

// Used only on the admin-facing reads (findRequestById, listRequests) — an
// admin reviewing a plan-switch request needs to see what the user is
// currently paying for (plan changes overwrite the subscription row
// immediately, with no proration; see subscription.service.js), so they can
// judge a request that would discard unused paid time instead of approving
// it blind. The user's own history view doesn't need this — they already
// know their own current plan.
const USER_WITH_SUBSCRIPTION_SELECT = {
    id: true, fullName: true, email: true,
    subscription: {select: {plan: true, currentPeriodEnd: true, billingCycle: true}},
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
        select: {...REQUEST_SELECT, user: {select: USER_WITH_SUBSCRIPTION_SELECT}},
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
            select: {...REQUEST_SELECT, user: {select: USER_WITH_SUBSCRIPTION_SELECT}},
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

// Atomic Pending -> {Approved|Rejected} transition. The WHERE clause folds
// the "is it still Pending" check into the same UPDATE statement as the
// write, so two admins reviewing the same request at once can't both pass
// a separate check-then-act read — only one UPDATE can match the row.
// Returns null if another review already claimed it first.
async function claimRequestForReview(id, {status, reviewedBy, reviewNote}) {
    const {count} = await prisma.paymentRequest.updateMany({
        where: {id, status: 'Pending'},
        data: {status, reviewedBy, reviewedAt: new Date(), reviewNote},
    });
    if (count === 0) {
        return null;
    }
    return prisma.paymentRequest.findUnique({where: {id}, select: REQUEST_SELECT});
}

// Locks the user row so a duplicate submission can't slip in between the
// pending-request lookup and the create — mirrors sites.repository.js's
// createSiteIfUnderLimit, which needs the same guard for the same reason
// (check and write touch different rows, so the check alone can't be atomic).
async function createPendingRequestIfNone({userId, plan, billingCycle, note}) {
    return prisma.$transaction(async (tx) => {
        await tx.$queryRaw`SELECT id FROM "User" WHERE id = ${userId} FOR UPDATE`;

        const existingPending = await tx.paymentRequest.findFirst({
            where: {userId, status: 'Pending'},
            orderBy: {createdAt: 'desc'},
            select: REQUEST_SELECT,
        });
        if (existingPending) {
            return {request: null, alreadyPending: true};
        }

        const request = await tx.paymentRequest.create({
            data: {userId, plan, billingCycle, note},
            select: REQUEST_SELECT,
        });
        return {request, alreadyPending: false};
    });
}

module.exports = {
    createPaymentRequest, findPendingRequestByUserId, listRequestsByUserId,
    findRequestById, listRequests, updateRequestStatus, claimRequestForReview,
    createPendingRequestIfNone,
}
