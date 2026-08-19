/**
 * Business logic for the analytics module: turns raw event counts into the
 * traffic chart, headline summary, and top-products/top-referrers views the
 * dashboard shows, after confirming the requesting user actually has access
 * to the site's data. The getPublic* functions near the bottom serve the
 * same data to the no-auth public dashboard (see
 * analytics/publicDashboard.routes.js), authorizing via a share token
 * instead of (userId, siteId) ownership — each pair shares its actual
 * computation (the compute* helpers below) so the two authorization paths
 * can never disagree about what a given site's numbers actually are.
 * getPublicSummary/getPublicTrafficOverview return `{data, site}` rather
 * than bare data (unlike their owner-facing counterparts, and unlike
 * getPublicTopProducts/getPublicTopReferrers) so their one caller —
 * analytics.controller.js's dataAsOf lookup — can reuse the already-
 * resolved site instead of resolving the token a second time.
 */
const { getDailyTraffic, countPageViews, countProductClicks, countUniqueVisitors, getTopClickedProducts, getTopReferrers } = require(
    './analytics.repository'
)
const { getSiteById, getSiteByPublicToken } = require('../sites/sites.service')
const {formateDateKey, buildDateRange, resolveDateBoundary} = require('../../utils/dateRange')
const AppError = require('../../utils/AppError')

/**
 * Guards every analytics read below. Ownership alone isn't enough to read a
 * site's analytics — a site that exists but no longer fits the owner's plan
 * (see sites.service.js's isSiteActive) shouldn't leak real numbers to the
 * dashboard just because the frontend chose not to ask. Rejecting here, not
 * just in the UI, is what makes this actual enforcement rather than a
 * cosmetic fog.
 */
function assertSiteActive(site) {
    if (!site.active) {
        throw new AppError("This site isn't included in your current plan. Upgrade to see its data.", 403);
    }
}

/** Daily page-view/click counts for a site, with days that had no events filled in as zero. */
async function computeTraffic(siteId, startDate, endDate) {
    const rawResults = await getDailyTraffic({ siteId, startDate, endDate });

    const resultsByDate = new Map();
    rawResults.forEach((row) => {
        resultsByDate.set(formateDateKey(row.date), {
            pageViews: Number(row.pageViews),
            clicks: Number(row.clicks)
        });
    });

    const allDates = buildDateRange(startDate, endDate);

    return allDates.map((date) => {
        const dayData = resultsByDate.get(date);
        return {
            date,
            pageViews: dayData ? dayData.pageViews : 0,
            clicks: dayData ? dayData.clicks : 0
        }
    })
}

async function getTrafficOverview({ siteId, userId, startDate, endDate }) {
    assertSiteActive(await getSiteById({ siteId, userId }));
    return computeTraffic(siteId, startDate, endDate);
}

/**
 * Same as getTrafficOverview, but for the public dashboard: authorized via
 * a share token instead of the owner's session. Returns the resolved site
 * alongside the traffic series (not just the series) so the controller can
 * reuse site.id for dataAsOf instead of resolving the token a second time —
 * a second call wouldn't just waste a lookup, it could observe a different
 * result if the owner disables/regenerates the link in the split second
 * between the two, discarding data that was already fetched successfully.
 */
async function getPublicTrafficOverview({ token, startDate, endDate }) {
    const site = await getSiteByPublicToken(token);
    const traffic = await computeTraffic(site.id, startDate, endDate);
    return {traffic, site};
}

/** The immediately-preceding period of equal length, for period-over-period comparison. */
function getPreviousPeriod (startDate, endDate) {
    const periodLengthMs = endDate.getTime() - startDate.getTime();

    const previousEndDate = new Date(startDate)
    const previousStartDate = new Date(startDate.getTime()- periodLengthMs);

    return {previousEndDate, previousStartDate};
}

/** Percent change from `previous` to `current`, treating a 0 baseline as +100% if current is nonzero. */
function calculatePercentChange(current, previous){
    if(previous === 0) {
        return current === 0 ? 0 : 100;
    }

    return Math.round(((current-previous)/previous) * 100);
}

/** Headline stats (page views, clicks, unique visitors) for a range, each with its change vs. the prior equal-length period. */
async function computeSummary(siteId, startDate, endDate) {
    const {previousStartDate, previousEndDate} = getPreviousPeriod(startDate, endDate);

    const [currentPageViews,
        currentClicks,
        currentVisitors,
        previousPageViews,
        previousClicks,
        previousVisitors
    ] = await Promise.all([
        countPageViews({siteId, startDate, endDate}),
        countProductClicks({siteId, startDate, endDate}),
        countUniqueVisitors({siteId, startDate, endDate}),
        countPageViews({siteId, startDate: previousStartDate, endDate: previousEndDate}),
        countProductClicks({siteId, startDate: previousStartDate, endDate: previousEndDate}),
        countUniqueVisitors({siteId, startDate: previousStartDate, endDate: previousEndDate})
    ]);

    return {
        pageViews: {
            value: currentPageViews,
            change: calculatePercentChange(currentPageViews, previousPageViews),
        },
        productClicks: {
            value: currentClicks,
            change: calculatePercentChange(currentClicks, previousClicks),
        },
        uniqueVisitors: {
            value: currentVisitors,
            change: calculatePercentChange(currentVisitors, previousVisitors),
        }
    }
}

async function getSummary({siteId, userId, startDate, endDate}) {
    assertSiteActive(await getSiteById({siteId, userId}));
    return computeSummary(siteId, startDate, endDate);
}

/**
 * Same as getSummary, but for the public dashboard: authorized via a share
 * token instead of the owner's session. Returns the resolved site alongside
 * the summary (see getPublicTrafficOverview's comment for why) so the
 * controller doesn't re-resolve the token a second time just for dataAsOf.
 */
async function getPublicSummary({token, startDate, endDate}) {
    const site = await getSiteByPublicToken(token);
    const summary = await computeSummary(site.id, startDate, endDate);
    return {summary, site};
}

/** Most-clicked products for a site within a date boundary. */
async function computeTopProducts(siteId, {startDate, endDate, limit}) {
    const range = resolveDateBoundary(startDate, endDate);
    const rows = await getTopClickedProducts({siteId, ...range, limit});

    return rows.map(r => ({
        productId: r.productId,
        productName: r.productName,
        clicks: r._count.productId,
    }));
}

async function getTopProducts(siteId, userId,{startDate, endDate, limit}) {
    assertSiteActive(await getSiteById({siteId, userId}));
    return computeTopProducts(siteId, {startDate, endDate, limit});
}

/** Same as getTopProducts, but for the public dashboard: authorized via a share token instead of the owner's session. */
async function getPublicTopProducts(token, {startDate, endDate, limit}) {
    const site = await getSiteByPublicToken(token);
    return computeTopProducts(site.id, {startDate, endDate, limit});
}

/** Top referring sources for a site within a date boundary. */
async function computeTopReferrers(siteId, {startDate, endDate, limit}) {
    const range = resolveDateBoundary(startDate, endDate);
    const rows = await getTopReferrers({siteId, ...range, limit});

    return rows.map (r => ({
        referrers: r.referrer,
        // Page views from this referrer, not deduplicated visitors — same
        // distinction as getTrafficOverview's pageViews above. Named to
        // match rather than reuse "visitors" for a number that isn't one.
        pageViews: r._count.referrer
    }))
}

async function getTopReferrersService(siteId, userId,{startDate, endDate, limit}) {
    assertSiteActive(await getSiteById({siteId, userId}));
    return computeTopReferrers(siteId, {startDate, endDate, limit});
}

/** Same as getTopReferrersService, but for the public dashboard: authorized via a share token instead of the owner's session. */
async function getPublicTopReferrers(token, {startDate, endDate, limit}) {
    const site = await getSiteByPublicToken(token);
    return computeTopReferrers(site.id, {startDate, endDate, limit});
}

module.exports = {
    getTrafficOverview, getSummary, getTopProducts, getTopReferrersService,
    getPublicTrafficOverview, getPublicSummary, getPublicTopProducts, getPublicTopReferrers,
}
