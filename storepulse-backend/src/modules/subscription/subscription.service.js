/**
 * Business logic for subscriptions: lazily syncing a lapsed subscription
 * back to Free (or a pending plan) the moment anyone actually looks at it,
 * and the user-initiated cancel flow that schedules that drop for later.
 */
const {upsertUserSubscription, createSubscriptionHistory, listSubscriptionHistory, findSubscriptionByUserId} = require('./subscription.repository');
const {findUserById} = require('../auth/auth.repository');
const {findSitesByUserId} = require('../sites/sites.repository');
const {getNewlyDeactivatedSites} = require('../sites/sites.service');
const {sendSubscriptionExpiredEmail, sendSitesDeactivatedEmail} = require('../email/email.service');
const {notifySubscriptionExpired, notifySitesDeactivated} = require('../notification/notification.service');
const AppError = require('../../utils/AppError');

/**
 * Same reasoning as admin.service.js's notifyBestEffort / billing.service.js's
 * local copy: by the time either caller below runs, the downgrade this is
 * reporting on has already committed, so a Resend outage shouldn't turn a
 * successful (if unwelcome) plan sync into a request failure. Logged, not
 * rethrown.
 */
async function notifyBestEffort(fn) {
    try {
        await fn();
    } catch (error) {
        console.error('Notification email failed:', error.message);
    }
}

/**
 * One row per real change, alongside whatever wrote it — never the only
 * record of a change (the Subscription row itself is), just the trail.
 * changedBy is an adminId, or null when the system did it on its own
 * (lazy expiry, a scheduled cancel finally landing).
 */
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

/**
 * Applies a lapsed subscription's downgrade the first time anyone actually
 * looks at it, and notifies the user it happened.
 *
 * resolveEffectivePlan (config/plans.js) is read-time only — it tells
 * enforcement (site creation, ingest quota) to treat a lapsed subscription
 * as Free without ever touching the row itself, so the DB can say "Pro"
 * indefinitely after the period ends. This is the one place that turns
 * that into a real, persisted fact: called wherever a subscription is
 * about to be shown to someone (this user's own /auth/me, the admin
 * panel), it writes the downgrade back the first time either of them
 * looks, instead of leaving every reader to quietly disagree with what's
 * actually being enforced.
 *
 * Also the landing point for a scheduled self-service cancel (see
 * cancelSubscription below): pendingPlan, if set, is what gets applied
 * instead of the bare Free fallback — same mechanism, one extra field.
 *
 * Lives in its own module (rather than admin's) because auth.service.js
 * needs it too for /auth/me — auth reaching into the admin module just to
 * resolve a subscription would be a strange dependency direction.
 *
 * Takes the subscription already fetched by the caller rather than
 * re-querying — avoids a second DB round trip on every single call just
 * to check a field the caller already has in hand.
 *
 * @param {string} userId
 * @param {object|null} subscription The caller's already-fetched subscription row.
 */
async function syncExpiredSubscription(userId, subscription) {
    if (!subscription || subscription.plan === 'Free') return subscription;

    const isExpired = subscription.currentPeriodEnd && new Date(subscription.currentPeriodEnd) < new Date();
    if (!isExpired) return subscription;

    const previousPlan = subscription.plan;
    const wasScheduled = Boolean(subscription.pendingPlan);
    const nextPlan = subscription.pendingPlan || 'Free';
    const updated = await upsertUserSubscription({userId, plan: nextPlan, status: 'Active', currentPeriodEnd: null});
    await recordSubscriptionHistory(userId, updated, {
        reason: wasScheduled ? 'system:scheduled-cancel-applied' : 'system:period-expired',
    });

    // Both of these only fire once per real transition — the guard clause
    // above (`subscription.plan === 'Free'`) means a second call after this
    // one has already landed finds the subscription already at Free and
    // returns immediately, without re-entering this block. A user who was
    // never told their plan lapsed (there's no scheduler here to catch this
    // proactively — see [[project_storepulse_overview]] for why this is
    // lazy in the first place) at least finds out the moment anything of
    // theirs reads their subscription next (their own /auth/me, or an
    // admin opening their detail page).
    const user = await findUserById(userId);
    if (user) {
        await notifyBestEffort(() => sendSubscriptionExpiredEmail({
            fullName: user.fullName, email: user.email, previousPlan, wasScheduled,
        }));
        await notifyBestEffort(() => notifySubscriptionExpired({userId, previousPlan, wasScheduled}));

        const sites = await findSitesByUserId(userId);
        const deactivatedSites = getNewlyDeactivatedSites(sites, previousPlan, nextPlan);
        if (deactivatedSites.length > 0) {
            await notifyBestEffort(() => sendSitesDeactivatedEmail({
                fullName: user.fullName, email: user.email, sites: deactivatedSites, plan: nextPlan,
            }));
            await notifyBestEffort(() => notifySitesDeactivated({userId, sites: deactivatedSites, plan: nextPlan}));
        }
    }

    return updated;
}

/**
 * User-initiated cancel. Doesn't touch plan/currentPeriodEnd/billingCycle —
 * there's no payment processor here to prorate a refund through, so instead
 * of cutting access off immediately, access stays at the current paid plan
 * through what's already been paid for, and syncExpiredSubscription applies
 * the drop to Free itself once currentPeriodEnd actually arrives. Admin
 * downgrades stay a separate, immediate path (setUserPlanService) — that's
 * still the tool for cause.
 */
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

/** Paginated subscription/billing history for one user. */
async function getSubscriptionHistoryService(userId, {page = 1, limit = 20} = {}) {
    const skip = (page - 1) * limit;
    const {entries, total} = await listSubscriptionHistory(userId, {skip, take: limit});
    return {entries, total, page, limit, totalPages: Math.ceil(total / limit) || 1};
}

module.exports = {syncExpiredSubscription, cancelSubscription, recordSubscriptionHistory, getSubscriptionHistoryService}
