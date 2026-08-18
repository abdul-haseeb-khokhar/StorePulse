const prisma = require('../../config/prisma');

const SUBSCRIPTION_SELECT = {
    id: true, userId: true, plan: true, status: true, currentPeriodEnd: true,
    canceledAt: true, billingCycle: true, pendingPlan: true,
};

async function findSubscriptionByUserId(userId) {
    return prisma.subscription.findUnique({
        where: {userId},
        select: SUBSCRIPTION_SELECT
    });
}

// billingCycle/pendingPlan default to null (cleared) rather than left
// untouched — most callers (admin plan-set, lazy-expiry applying) want
// exactly that: a real plan change should drop any stale cycle or pending
// cancel from before it. The one caller that needs the opposite
// (cancelSubscription, which changes only pendingPlan) passes the
// existing billingCycle back in explicitly to preserve it.
async function upsertUserSubscription({userId, plan, status, currentPeriodEnd, billingCycle = null, pendingPlan = null}) {
    return prisma.subscription.upsert({
        where: {userId},
        create: {userId, plan, status, currentPeriodEnd, billingCycle, pendingPlan},
        update: {plan, status, currentPeriodEnd, billingCycle, pendingPlan},
        select: SUBSCRIPTION_SELECT
    });
}

async function createSubscriptionHistory({userId, plan, billingCycle, status, currentPeriodEnd, changedBy, reason}) {
    return prisma.subscriptionHistory.create({
        data: {userId, plan, billingCycle, status, currentPeriodEnd, changedBy, reason}
    });
}

async function listSubscriptionHistory(userId, {skip = 0, take = 20} = {}) {
    const [entries, total] = await Promise.all([
        prisma.subscriptionHistory.findMany({
            where: {userId}, skip, take, orderBy: {createdAt: 'desc'}
        }),
        prisma.subscriptionHistory.count({where: {userId}}),
    ]);
    return {entries, total};
}

module.exports = {
    findSubscriptionByUserId, upsertUserSubscription, createSubscriptionHistory, listSubscriptionHistory,
}
