/**
 * Prisma queries backing the admin module: user/site management, platform
 * stats, and the admin activity log.
 */
const prisma = require('../../config/prisma');

/** Updates a user row and returns it with its sites for the admin UI. */
async function updateUserStatus(userId, dataToBeUpdated) {
    return prisma.user.update({
        where: {id: userId},
        data: dataToBeUpdated,
        select: {id: true, fullName: true, email: true, createdAt: true, status: true,
            sites: {select: {id: true, name: true, domain: true, createdAt: true}}
        }
    });
}

/** Paginated, optionally searched/filtered user listing. */
async function listUsers({skip, take, search, status}) {
    const where = {
        ...(status ? {status} : {}),
        ...(search ? {
            OR: [
                {fullName: {contains: search, mode: 'insensitive'}},
                {email: {contains: search, mode: 'insensitive'}},
            ]
        } : {}),
    };

    const [users, total] = await Promise.all([
        prisma.user.findMany({
            where, skip, take, orderBy: {createdAt: 'desc'},
            select: {id: true, fullName: true, email: true, status: true, isEmailVerified: true, createdAt: true,
                subscription: {select: {plan: true, currentPeriodEnd: true}}
            }
        }),
        prisma.user.count({where}),
    ]);

    return {users, total};
}

/** A single user with their sites and subscription, for the admin detail view. */
async function findUserByIdWithSites(userId) {
    return prisma.user.findUnique({
        where: {id: userId},
        select: {id: true, fullName: true, email: true, status: true, isEmailVerified: true, createdAt: true,
            sites: {select: {id: true, name: true, domain: true, createdAt: true}},
            subscription: {
                select: {plan: true, status: true, currentPeriodEnd: true, pendingPlan: true, billingCycle: true},
            }
        }
    });
}

/** Paginated, optionally searched site listing across all users. */
async function listSites({skip, take, search}) {
    const where = search ? {
        OR: [
            {name: {contains: search, mode: 'insensitive'}},
            {domain: {contains: search, mode: 'insensitive'}},
        ]
    } : {};

    const [sites, total] = await Promise.all([
        prisma.site.findMany({
            where, skip, take, orderBy: {createdAt: 'desc'},
            select: {id: true, name: true, domain: true, createdAt: true,
                user: {select: {id: true, fullName: true, email: true}}
            }
        }),
        prisma.site.count({where}),
    ]);

    return {sites, total};
}

/** Platform-wide counts for the admin dashboard's stat tiles. */
async function getPlatformStats() {
    const [totalUsers, activeUsers, bannedUsers, totalSites, totalEvents, newUsersLast7Days, planCounts, usersWithoutSubscription] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({where: {status: 'Active'}}),
        prisma.user.count({where: {status: 'Banned'}}),
        prisma.site.count(),
        prisma.event.count(),
        prisma.user.count({where: {createdAt: {gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)}}}),
        prisma.subscription.groupBy({by: ['plan'], _count: {plan: true}}),
        // A user with no Subscription row at all is still on Free (see
        // resolveEffectivePlan) — groupBy only sees rows that exist, so
        // this fills in the count groupBy can't.
        prisma.user.count({where: {subscription: null}}),
    ]);

    // Deliberately the stored plan, not the lazily-resolved effective one —
    // same tradeoff as listUsersService: a lapsed Pro shows as Pro here
    // until someone actually views that user and syncExpiredSubscription
    // writes the downgrade back. A platform-wide count re-resolving every
    // subscription on every dashboard load isn't worth it for a number
    // that's already a snapshot the moment it's read.
    const planDistribution = {Free: usersWithoutSubscription, Pro: 0, Business: 0};
    for (const row of planCounts) {
        planDistribution[row.plan] = (planDistribution[row.plan] || 0) + row._count.plan;
    }

    return {totalUsers, activeUsers, bannedUsers, totalSites, totalEvents, newUsersLast7Days, planDistribution};
}

/**
 * Every user with their plan and site count, unfiltered. Unpaginated on
 * purpose — this feeds listOverLimitUsersService, which has to look at
 * every user's site count vs. their plan to find the handful who are over.
 * Fine at the scale this app runs at today; would need a SQL-side
 * HAVING-style filter instead of an in-memory one if the user base grows
 * enough to make a full table scan here expensive.
 */
async function listUsersWithSiteCounts() {
    return prisma.user.findMany({
        select: {
            id: true, fullName: true, email: true,
            subscription: {select: {plan: true, currentPeriodEnd: true}},
            _count: {select: {sites: true}},
        },
    });
}

/**
 * Backs the pending-count badge on the admin nav's "Payment Requests" link
 * — a plain count, not a stored/dismissable notification, so it always
 * reflects exactly what's still waiting for review right now and needs no
 * read/unread state to track.
 */
async function countPendingPaymentRequests() {
    return prisma.paymentRequest.count({where: {status: 'Pending'}});
}

/** Appends one row to the append-only admin activity log. */
async function createAdminLog({adminId, action, targetedUserId}) {
    return prisma.adminLog.create({
        data: {adminId, action, targetedUserId}
    });
}

/**
 * Paginated admin activity log, with admin/target names resolved manually.
 *
 * adminLog has no Prisma relation to Admin/User (just raw id columns), so
 * the admin/targetedUser names have to be resolved with two follow-up batch
 * lookups here rather than a nested `select`. Left this way rather than
 * adding relations for it — adminLog is deliberately a flat, append-only
 * trail, and a real FK would mean deciding what happens to old log rows
 * when an admin or user is later deleted, which isn't a question this
 * feature needs to answer.
 */
async function listAdminLogs({skip, take}) {
    const [logs, total] = await Promise.all([
        prisma.adminLog.findMany({skip, take, orderBy: {createdAt: 'desc'}}),
        prisma.adminLog.count(),
    ]);

    const adminIds = [...new Set(logs.map((l) => l.adminId))];
    const targetIds = [...new Set(logs.map((l) => l.targetedUserId).filter(Boolean))];

    const [admins, targets] = await Promise.all([
        prisma.admin.findMany({where: {id: {in: adminIds}}, select: {id: true, fullName: true, email: true}}),
        prisma.user.findMany({where: {id: {in: targetIds}}, select: {id: true, fullName: true, email: true}}),
    ]);
    const adminById = new Map(admins.map((a) => [a.id, a]));
    const targetById = new Map(targets.map((u) => [u.id, u]));

    const enrichedLogs = logs.map((log) => ({
        ...log,
        admin: adminById.get(log.adminId) || null,
        targetedUser: log.targetedUserId ? (targetById.get(log.targetedUserId) || null) : null,
    }));

    return {logs: enrichedLogs, total};
}

module.exports = {
    updateUserStatus, listUsers, findUserByIdWithSites, listSites, getPlatformStats, createAdminLog,
    listUsersWithSiteCounts, listAdminLogs, countPendingPaymentRequests,
}
