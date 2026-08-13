const {upsertUserSubscription, createSubscriptionHistory, listSubscriptionHistory, findSubscriptionByUserId} = require('./subscription.repository');
const AppError = require('../../utils/AppError');

// One row per real change, alongside whatever wrote it — never the only
// record of a change (the Subscription row itself is), just the trail.
// changedBy is an adminId, or null when the system did it on its own
// (lazy expiry, a scheduled cancel finally landing).
async function recordSubscriptionHistory(userId, subscription, {changedBy = null, reason}) {
    return createSubscriptionHistory({
        userId,
        plan: subscription.plan,
        billingCycle: subscription.billingCycle,
        status: subscription.status,
        currentPeriodEnd: subscription.currentPeriodEnd,
        changedBy,
        reason,
    });
}

// resolveEffectivePlan (config/plans.js) is read-time only — it tells
// enforcement (site creation, ingest quota) to treat a lapsed subscription
// as Free without ever touching the row itself, so the DB can say "Pro"
// indefinitely after the period ends. This is the one place that turns
// that into a real, persisted fact: called wherever a subscription is
// about to be shown to someone (this user's own /auth/me, the admin
// panel), it writes the downgrade back the first time either of them
// looks, instead of leaving every reader to quietly disagree with what's
// actually being enforced.
//
// Also the landing point for a scheduled self-service cancel (see
// cancelSubscription below): pendingPlan, if set, is what gets applied
// instead of the bare Free fallback — same mechanism, one extra field.
//
// Lives in its own module (rather than admin's) because auth.service.js
// needs it too for /auth/me — auth reaching into the admin module just to
// resolve a subscription would be a strange dependency direction.
//
// Takes the subscription already fetched by the caller rather than
// re-querying — avoids a second DB round trip on every single call just
// to check a field the caller already has in hand.
async function syncExpiredSubscription(userId, subscription) {
    if (!subscription || subscription.plan === 'Free') return subscription;

    const isExpired = subscription.currentPeriodEnd && new Date(subscription.currentPeriodEnd) < new Date();
    if (!isExpired) return subscription;

    const nextPlan = subscription.pendingPlan || 'Free';
    const updated = await upsertUserSubscription({userId, plan: nextPlan, status: 'Active', currentPeriodEnd: null});
    await recordSubscriptionHistory(userId, updated, {
        reason: subscription.pendingPlan ? 'system:scheduled-cancel-applied' : 'system:period-expired',
    });
    return updated;
}

// User-initiated cancel. Doesn't touch plan/currentPeriodEnd/billingCycle —
// there's no payment processor here to prorate a refund through, so instead
// of cutting access off immediately, access stays at the current paid plan
// through what's already been paid for, and syncExpiredSubscription applies
// the drop to Free itself once currentPeriodEnd actually arrives. Admin
// downgrades stay a separate, immediate path (setUserPlanService) — that's
// still the tool for cause.
async function cancelSubscription(userId) {
    const subscription = await findSubscriptionByUserId(userId);

    if (!subscription || subscription.plan === 'Free') {
        throw new AppError("You're already on the Free plan.", 400);
    }
    if (subscription.pendingPlan === 'Free') {
        throw new AppError('Your plan is already set to move to Free at the end of this billing period.', 400);
    }

    const updated = await upsertUserSubscription({
        userId,
        plan: subscription.plan,
        status: subscription.status,
        currentPeriodEnd: subscription.currentPeriodEnd,
        billingCycle: subscription.billingCycle,
        pendingPlan: 'Free',
    });
    await recordSubscriptionHistory(userId, updated, {reason: 'user:cancel-requested'});
    return updated;
}

async function getSubscriptionHistoryService(userId, {page = 1, limit = 20} = {}) {
    const skip = (page - 1) * limit;
    const {entries, total} = await listSubscriptionHistory(userId, {skip, take: limit});
    return {entries, total, page, limit, totalPages: Math.ceil(total / limit) || 1};
}

module.exports = {syncExpiredSubscription, cancelSubscription, recordSubscriptionHistory, getSubscriptionHistoryService}
