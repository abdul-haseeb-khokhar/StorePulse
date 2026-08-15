const {
    updateUserStatus, listUsers, findUserByIdWithSites, listSites, getPlatformStats, createAdminLog,
    listUsersWithSiteCounts, listAdminLogs,
} = require('./admin.repository');
const {findUserById} = require('../auth/auth.repository')
const {findSitesByUserId} = require('../sites/sites.repository');
const {invalidateCachedSite} = require('../ingest/ingest.cache');
const {upsertUserSubscription, findSubscriptionByUserId} = require('../subscription/subscription.repository');
const {syncExpiredSubscription, recordSubscriptionHistory, getSubscriptionHistoryService} = require('../subscription/subscription.service');
const {
    listRequests, findRequestById, claimRequestForReview, findPendingRequestByUserId, updateRequestStatus,
} = require('../paymentRequest/paymentRequest.repository');
const {sendPlanChangedEmail, sendAccountStatusChangedEmail, sendPaymentRequestReviewedEmail} = require('../email/email.service');
const {periodEndFromCycle, resolveEffectivePlan, PLAN_LIMITS} = require('../../config/plans');
const AppError = require('../../utils/AppError');

// Best-effort — by the time this runs, the admin action it's reporting on
// has already fully succeeded and been written to the DB, so a Resend
// outage or a bad address should never surface as a failure of the action
// itself. Logged, not rethrown.
async function notifyBestEffort(sendFn, args) {
    try {
        await sendFn(args);
    } catch (error) {
        console.error('Notification email failed:', error.message);
    }
}

async function updateUserStatusService(userId, status, adminId) {
    const user = await findUserById(userId)

    if(!user) {
        throw new AppError('User not found', 404);
    }

    if(user.status === 'Deleted') {
        throw new AppError("This is a deleted user and can't be modified", 400);
    }

    let result;
    if(user.status !== 'Active' && status === 'Active'){
        if(!user.isEmailVerified) {
            throw new AppError('User email is not verified yet', 400);
        }
        const updatedUser = await updateUserStatus(userId, {status});
        result = {updatedUser, message : 'User status is activated now'};
    } else if(user.status !== 'Banned' && status === 'Banned'){
        const updatedUser = await updateUserStatus(userId, {status});
        result = {updatedUser, message : 'User is banned now'};
    } else if(status === 'Deleted') {
        const updatedUser = await updateUserStatus(userId, {status, email: `deleted-${userId}-@storepulse.invalid`});
        result = {updatedUser, message : 'User is deleted now'};
    } else {
        throw new AppError("Changing to same status is not allowed", 400);
    }

    // Ingest caches each site's owner status for up to 30 minutes (see
    // ingest.cache.js's CACHE_TTL_SECONDS) — without invalidating here, a
    // ban wouldn't cut off ingestion until that cache aged out, and a
    // reactivation would stay blocked just as long. Same reasoning as the
    // plan-change invalidation in setUserPlanService below.
    const sites = await findSitesByUserId(userId);
    await Promise.all(sites.map((site) => invalidateCachedSite(site.apiKey)));

    await createAdminLog({adminId, action: `status:${status}`, targetedUserId: userId});

    // user.email (fetched before the update) rather than
    // result.updatedUser.email — for a Deleted transition that field is
    // already the anonymized @storepulse.invalid address, which isn't
    // where the actual person can be reached.
    await notifyBestEffort(sendAccountStatusChangedEmail, {fullName: user.fullName, email: user.email, status});

    return result;
}

async function listUsersService({page, limit, search, status}) {
    const skip = (page - 1) * limit;
    const {users, total} = await listUsers({skip, take: limit, search, status});

    // Read-only, like ingest/site-limit enforcement — a lapsed subscription
    // shows as Free here without writing anything back. Unlike a single
    // user's own page (getUserDetailService), a list of up to `limit` rows
    // isn't worth a write per row just to display the same downgrade the
    // next real view of that user would persist anyway.
    const usersWithPlan = users.map(({subscription, ...user}) => ({
        ...user,
        plan: resolveEffectivePlan(subscription),
    }));

    return {users: usersWithPlan, total, page, limit, totalPages: Math.ceil(total / limit)};
}

async function getUserDetailService(userId) {
    const user = await findUserByIdWithSites(userId);
    if(!user) {
        throw new AppError('User not found', 404);
    }

    const subscription = await syncExpiredSubscription(userId, user.subscription);
    return {...user, subscription};
}

async function listSitesService({page, limit, search}) {
    const skip = (page - 1) * limit;
    const {sites, total} = await listSites({skip, take: limit, search});

    return {sites, total, page, limit, totalPages: Math.ceil(total / limit)};
}

async function setUserPlanService({userId, plan, billingCycle, status, adminId}) {
    const user = await findUserById(userId);
    if(!user) {
        throw new AppError('User not found', 404);
    }

    const existingSubscription = await findSubscriptionByUserId(userId);
    const currentPlan = existingSubscription?.plan || 'Free';
    const currentStatus = existingSubscription?.status || 'Active';
    const nextStatus = status || 'Active';

    // Free has no period to renew, so re-picking it while already on Free
    // (with nothing else about it changing either) can never actually
    // change anything — a true no-op, skipped before any write, cache
    // invalidation, or admin-log entry happens. Pro/Business are
    // deliberately NOT short-circuited the same way: resubmitting the same
    // plan there is how an admin renews it (pushes currentPeriodEnd out
    // another cycle), which is a real change even though `plan` itself
    // doesn't move.
    const isNoOpFreeReselect = plan === 'Free' && currentPlan === 'Free'
        && nextStatus === currentStatus && !existingSubscription?.pendingPlan;

    // Run before the no-op short-circuit below, not after the plan write —
    // a direct "set plan" call is the admin's real word on this user's
    // subscription even when nothing about the plan itself changes (e.g.
    // re-confirming Free is effectively denying a pending upgrade request),
    // so both paths need this, not just the one that goes on to write a
    // new subscription. Running it this early — before any of the writes
    // below, not after them — also shrinks the window where a user could
    // slip in an unrelated new request between an admin's approval action
    // and this scan picking it up instead of the one actually being acted on.
    await supersedePendingRequest({userId, adminId, user});

    if (isNoOpFreeReselect) {
        return {subscription: existingSubscription, message: 'User is already on the Free plan'};
    }

    // Free doesn't run out, so it has no period to track and no cycle to
    // remember. Paid tiers get a period computed from the chosen cycle —
    // never a hand-picked date — and the cycle itself is now persisted
    // (previously used once here and thrown away).
    const currentPeriodEnd = plan === 'Free' ? null : periodEndFromCycle(billingCycle);
    const persistedBillingCycle = plan === 'Free' ? null : billingCycle;

    // An admin setting a plan directly is a real, immediate decision —
    // it overrides (clears) any pending self-service cancel the user may
    // have queued up, same as it overrides everything else about the
    // previous subscription state. pendingPlan defaults to null in
    // upsertUserSubscription, so simply not passing it here is enough.
    const subscription = await upsertUserSubscription({
        userId, plan, status: nextStatus, currentPeriodEnd, billingCycle: persistedBillingCycle,
    });
    await recordSubscriptionHistory(userId, subscription, {changedBy: adminId, reason: 'admin:plan-change'});

    // Ingest caches each site's owner-plan for up to 30 minutes (see
    // ingest.cache.js's CACHE_TTL_SECONDS) — without invalidating here, a
    // plan change wouldn't reach quota enforcement until that cache aged out.
    const sites = await findSitesByUserId(userId);
    await Promise.all(sites.map((site) => invalidateCachedSite(site.apiKey)));

    await createAdminLog({adminId, action: `plan:${plan}`, targetedUserId: userId});

    await notifyBestEffort(sendPlanChangedEmail, {
        fullName: user.fullName, email: user.email, plan,
        billingCycle: persistedBillingCycle, currentPeriodEnd,
    });

    return {subscription, message: `User plan set to ${plan}`};
}

// A direct plan change makes any request this user has waiting for review
// moot — left alone, approving it later would silently re-run
// setUserPlanService and push currentPeriodEnd out another cycle for a
// request that no longer reflects what's actually being decided. This is
// queue cleanup, not the operation itself, so — same reasoning as
// notifyBestEffort below — a failure here is logged and swallowed rather
// than thrown: the plan change it's called from has typically already
// committed by the time this runs, and a stale pending request left behind
// on a rare failure is the same state as before this existed at all, not a
// new problem.
async function supersedePendingRequest({userId, adminId, user}) {
    try {
        const supersededRequest = await findPendingRequestByUserId(userId);
        if (!supersededRequest) return;

        const reviewNote = 'Superseded by a direct plan change from an admin.';
        await updateRequestStatus(supersededRequest.id, {status: 'Rejected', reviewedBy: adminId, reviewNote});
        await createAdminLog({adminId, action: 'payment-request:auto-rejected', targetedUserId: userId});
        await notifyBestEffort(sendPaymentRequestReviewedEmail, {
            fullName: user.fullName, email: user.email, status: 'Rejected',
            plan: supersededRequest.plan, reviewNote,
        });
    } catch (error) {
        console.error('Failed to auto-resolve superseded payment request:', error.message);
    }
}

async function listPaymentRequestsService({page, limit, status}) {
    const skip = (page - 1) * limit;
    const {requests, total} = await listRequests({skip, take: limit, status});

    return {requests, total, page, limit, totalPages: Math.ceil(total / limit) || 1};
}

// Approving reuses setUserPlanService rather than upserting the
// subscription directly here — there should be exactly one place that
// actually turns "a plan should change" into a written Subscription row,
// so a payment-request approval and an admin manually setting a plan stay
// governed by the same no-op guard, cache invalidation, history entry, and
// admin log.
async function reviewPaymentRequestService({requestId, status, note, adminId}) {
    const request = await findRequestById(requestId);
    if (!request) {
        throw new AppError('Payment request not found', 404);
    }

    // Atomic claim, not check-then-act: closes the race where two admins
    // review the same request at nearly the same instant.
    const updated = await claimRequestForReview(requestId, {status, reviewedBy: adminId, reviewNote: note});
    if (!updated) {
        const latest = await findRequestById(requestId);
        throw new AppError(`This request has already been ${latest.status.toLowerCase()}`, 400);
    }

    let planResult = null;
    if (status === 'Approved') {
        planResult = await setUserPlanService({
            userId: request.userId, plan: request.plan, billingCycle: request.billingCycle, adminId,
        });
    }

    await createAdminLog({
        adminId, action: `payment-request:${status.toLowerCase()}`, targetedUserId: request.userId,
    });

    await notifyBestEffort(sendPaymentRequestReviewedEmail, {
        fullName: request.user.fullName, email: request.user.email, status, plan: request.plan, reviewNote: note,
    });

    return {
        request: updated,
        subscription: planResult?.subscription ?? null,
        message: `Payment request ${status.toLowerCase()}.`,
    };
}

async function listOverLimitUsersService() {
    const users = await listUsersWithSiteCounts();

    return users
        .map((u) => ({
            id: u.id, fullName: u.fullName, email: u.email,
            plan: resolveEffectivePlan(u.subscription),
            siteCount: u._count.sites,
        }))
        .filter((u) => u.siteCount > PLAN_LIMITS[u.plan].maxSites);
}

// Thin pass-through to the same history service the user's own billing
// page uses — an admin viewing one user's history and that user viewing
// their own should never be able to disagree about what it says.
async function getUserBillingHistoryService(userId, {page, limit}) {
    const user = await findUserById(userId);
    if (!user) {
        throw new AppError('User not found', 404);
    }

    return getSubscriptionHistoryService(userId, {page, limit});
}

async function listAdminLogsService({page, limit}) {
    const skip = (page - 1) * limit;
    const {logs, total} = await listAdminLogs({skip, take: limit});

    return {logs, total, page, limit, totalPages: Math.ceil(total / limit) || 1};
}

module.exports = {
    updateUserStatusService, listUsersService, getUserDetailService, listSitesService, getPlatformStats,
    setUserPlanService, listPaymentRequestsService, reviewPaymentRequestService,
    listOverLimitUsersService, listAdminLogsService, getUserBillingHistoryService,
}
