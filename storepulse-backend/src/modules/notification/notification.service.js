/**
 * Business logic for in-app notifications, split into two sides: the reader
 * (what the bell on AppHeader polls) and the writer (one function per event
 * type, called from whichever module owns that event).
 */
const {createNotification, listByUser, countUnreadByUser, markReadForUser, markAllReadForUser} = require('./notification.repository');
const AppError = require('../../utils/AppError');

/**
 * Reader side. Same {items, total, page, limit, totalPages} shape every
 * other list endpoint in this app uses (billing history, admin users, ...),
 * plus unreadCount alongside the page of results so the frontend doesn't
 * need a second request just to badge the bell.
 */
async function listMyNotifications(userId, {page = 1, limit = 20} = {}) {
    const skip = (page - 1) * limit;
    const [{notifications, total}, unreadCount] = await Promise.all([
        listByUser(userId, {skip, take: limit}),
        countUnreadByUser(userId),
    ]);
    return {notifications, total, page, limit, totalPages: Math.ceil(total / limit) || 1, unreadCount};
}

async function markMyNotificationRead(id, userId) {
    const found = await markReadForUser(id, userId);
    if (!found) {
        throw new AppError('Notification not found', 404);
    }
}

async function markAllMyNotificationsRead(userId) {
    await markAllReadForUser(userId);
}

// --- Writer side: one function per event type, called from the module
// that owns that event (admin.service.js, subscription.service.js) right
// next to the existing notifyBestEffort(sendXEmail, ...) call for the same
// event — in-app is a second channel alongside email, not a replacement,
// so both fire from the same call site rather than one triggering the other.

async function notifyPlanChanged({userId, plan, billingCycle}) {
    const cycleSuffix = billingCycle ? ` (${billingCycle})` : '';
    await createNotification({
        type: 'PLAN_CHANGED',
        message: `Your plan was changed to ${plan}${cycleSuffix}.`,
        link: '/billing',
        userId,
    });
}

async function notifySubscriptionExpired({userId, previousPlan, wasScheduled}) {
    const message = wasScheduled
        ? "Your cancellation has taken effect — you're now on the Free plan."
        : `Your ${previousPlan} plan's billing period ended without a renewal, so you're now on the Free plan.`;
    await createNotification({type: 'SUBSCRIPTION_EXPIRED', message, link: '/billing', userId});
}

async function notifySitesDeactivated({userId, sites, plan}) {
    const message = sites.length === 1
        ? `Your site "${sites[0].name}" is now inactive — it's outside your ${plan} plan's site limit.`
        : `${sites.length} of your sites are now inactive — they're outside your ${plan} plan's site limit.`;
    await createNotification({type: 'SITES_DEACTIVATED', message, link: '/sites', userId});
}

async function notifyPaymentRequestReviewed({userId, status, plan}) {
    await createNotification({
        type: 'PAYMENT_REQUEST_REVIEWED',
        message: `Your payment request for ${plan} was ${status.toLowerCase()}.`,
        link: '/billing',
        userId,
    });
}

module.exports = {
    listMyNotifications, markMyNotificationRead, markAllMyNotificationsRead,
    notifyPlanChanged, notifySubscriptionExpired, notifySitesDeactivated, notifyPaymentRequestReviewed,
}
