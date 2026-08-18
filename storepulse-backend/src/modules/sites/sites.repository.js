/**
 * Prisma queries backing the sites module: creation (with a plan-limit
 * guard), lookups, API key updates, and the shared "creation rank" query
 * both this module and ingest rely on.
 */
const prisma = require('../../config/prisma')
const {resolveEffectivePlan} = require('../../config/plans')

// Locks the user's row for the duration of the transaction so two
// concurrent "add site" requests from the same user can't both read the
// same under-the-limit count and both insert — the second transaction
// blocks on the row lock until the first commits, then re-counts and sees
// the first insert already there. Only this user's row is locked, so it
// doesn't serialize unrelated users' site creation against each other.
async function createSiteIfUnderLimit({name, domain, apiKey, userId, maxSites}) {
    return prisma.$transaction(async (tx) => {
        await tx.$queryRaw`SELECT id FROM "User" WHERE id = ${userId} FOR UPDATE`;

        const existingCount = await tx.site.count({where: {userId}});
        if (existingCount >= maxSites) {
            return {site: null, limitExceeded: true};
        }

        const site = await tx.site.create({data: {name, domain, apiKey, userId}});
        return {site, limitExceeded: false};
    });
}

async function findSitesByUserId(userId) {
    return prisma.site.findMany({
        where: {userId},
        orderBy: {createdAt: 'desc'}
    });
}

async function findSiteById(id) {
    return prisma.site.findUnique({
        where:{id}
    })
}

async function updateApiKey(id, newApiKey) {
    return prisma.site.update({
        where:{id},
        data: {apiKey: newApiKey}
    })
}

async function findUserPlan(userId) {
    const subscription = await prisma.subscription.findUnique({
        where: {userId},
        select: {plan: true, currentPeriodEnd: true}
    });

    return resolveEffectivePlan(subscription);
}

// A site's rank (1st created, 2nd, ...) among its owner's sites — fixed
// forever once it exists, since sites are never deleted or reordered. The
// single, shared source for that rank: every caller across every module
// (sites, ingest) goes through this instead of writing its own count query,
// so "what counts as this site's rank" can only ever be defined once.
// Tie-broken by id (lexicographic, arbitrary but stable) so two sites
// created in the same millisecond still resolve to a strict order instead
// of tying for the same rank — same tie-break annotateActiveSites uses for
// its in-memory ranking, so the two never disagree on a tie.
async function countSitesCreatedUpTo(userId, createdAt, siteId) {
    return prisma.site.count({
        where: {
            userId,
            OR: [
                {createdAt: {lt: createdAt}},
                {createdAt, id: {lte: siteId}},
            ],
        },
    });
}

module.exports = {
    createSiteIfUnderLimit, findSiteById, findSitesByUserId, updateApiKey, findUserPlan, countSitesCreatedUpTo
}
