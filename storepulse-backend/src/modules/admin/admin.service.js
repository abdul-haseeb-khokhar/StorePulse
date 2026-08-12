const {updateUserStatus, listUsers, findUserByIdWithSites, listSites, getPlatformStats, createAdminLog, upsertUserSubscription, findSubscriptionByUserId} = require('./admin.repository');
const {findUserById} = require('../auth/auth.repository')
const {findSitesByUserId} = require('../sites/sites.repository');
const {invalidateCachedSite} = require('../ingest/ingest.cache');
const {periodEndFromCycle} = require('../../config/plans');
const AppError = require('../../utils/AppError');

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

    await createAdminLog({adminId, action: `status:${status}`, targetedUserId: userId});
    return result;
}

async function listUsersService({page, limit, search, status}) {
    const skip = (page - 1) * limit;
    const {users, total} = await listUsers({skip, take: limit, search, status});

    return {users, total, page, limit, totalPages: Math.ceil(total / limit)};
}

async function getUserDetailService(userId) {
    const user = await findUserByIdWithSites(userId);
    if(!user) {
        throw new AppError('User not found', 404);
    }

    const subscription = await syncExpiredSubscription(userId, user.subscription);
    return {...user, subscription};
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
// Takes the subscription already fetched by the caller rather than
// re-querying — avoids a second DB round trip on every single call just
// to check a field the caller already has in hand.
async function syncExpiredSubscription(userId, subscription) {
    if (!subscription || subscription.plan === 'Free') return subscription;

    const isExpired = subscription.currentPeriodEnd && new Date(subscription.currentPeriodEnd) < new Date();
    if (!isExpired) return subscription;

    return upsertUserSubscription({userId, plan: 'Free', status: 'Active', currentPeriodEnd: null});
}

async function listSitesService({page, limit, search}) {
    const skip = (page - 1) * limit;
    const {sites, total} = await listSites({skip, take: limit, search});

    return {sites, total, page, limit, totalPages: Math.ceil(total / limit)};
}

async function setUserPlanService({userId, plan, billingCycle, adminId}) {
    const user = await findUserById(userId);
    if(!user) {
        throw new AppError('User not found', 404);
    }

    const existingSubscription = await findSubscriptionByUserId(userId);
    const currentPlan = existingSubscription?.plan || 'Free';

    // Free has no period to renew, so re-picking it while already on Free
    // can never actually change anything — a true no-op, skipped before any
    // write, cache invalidation, or admin-log entry happens. Pro/Business
    // are deliberately NOT short-circuited the same way: resubmitting the
    // same plan there is how an admin renews it (pushes currentPeriodEnd
    // out another cycle), which is a real change even though `plan` itself
    // doesn't move.
    if (plan === 'Free' && currentPlan === 'Free') {
        return {subscription: existingSubscription, message: 'User is already on the Free plan'};
    }

    // Free doesn't run out, so it has no period to track. Paid tiers get
    // one computed from the chosen cycle — never a hand-picked date.
    const currentPeriodEnd = plan === 'Free' ? null : periodEndFromCycle(billingCycle);

    const subscription = await upsertUserSubscription({userId, plan, status: 'Active', currentPeriodEnd});

    // Ingest caches each site's owner-plan for up to 30 minutes (see
    // ingest.cache.js's CACHE_TTL_SECONDS) — without invalidating here, a
    // plan change wouldn't reach quota enforcement until that cache aged out.
    const sites = await findSitesByUserId(userId);
    await Promise.all(sites.map((site) => invalidateCachedSite(site.apiKey)));

    await createAdminLog({adminId, action: `plan:${plan}`, targetedUserId: userId});

    return {subscription, message: `User plan set to ${plan}`};
}

module.exports = {updateUserStatusService, listUsersService, getUserDetailService, listSitesService, getPlatformStats, setUserPlanService, syncExpiredSubscription}
