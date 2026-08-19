/**
 * HTTP layer for the analytics module: per-site traffic, summary, and
 * top-products/top-referrers endpoints, plus their public (no-auth)
 * counterparts mounted separately in publicDashboard.routes.js.
 */
const {
    getTrafficOverview, getSummary, getTopProducts, getTopReferrersService,
    getPublicTrafficOverview, getPublicSummary, getPublicTopProducts, getPublicTopReferrers,
} = require('./analytics.service');
const {getSiteByPublicToken} = require('../sites/sites.service');
const {getLastFlushAt} = require('../ingest/ingest.buffer');

/** Converts the `range` query shorthand ('7d'/'30d'/'90d') into a concrete start/end date, defaulting to 7 days. */
function getDateRangeFromQuery(range) {
    const endDate = new Date();
    const startDate = new Date();
    const days = {'7d' : 7, '30d' : 30, '90d' : 90} [range] || 7;
    startDate.setDate(startDate.getDate() - days);

    return {startDate, endDate}
}

/** GET /analytics/:siteId/traffic — daily page-view/click series for the range. */
async function getTrafficController(req, res, next) {
    try {
        const {siteId} = req.params;
        const {range} = req.query;
        const userId = req.user.id;
        const {startDate, endDate} = getDateRangeFromQuery(range);

        const traffic = await getTrafficOverview({siteId, userId, startDate, endDate});
        const dataAsOf = await getLastFlushAt(siteId);

        res.status(200).json({traffic, dataAsOf});

    } catch (error) {
        next(error);
    }
}

/** GET /analytics/:siteId/summary — headline stats for the range, with period-over-period change. */
async function getSummaryController(req, res, next) {
    try {
        const {siteId} = req.params;
        const { range } = req.query;
        const userId = req.user.id;

        const {startDate, endDate} = getDateRangeFromQuery(range);

        const summary = await getSummary({siteId, userId, startDate, endDate});
        const dataAsOf = await getLastFlushAt(siteId);
        res.status(200).json({summary, dataAsOf});
    } catch (error) {
        next(error)
    }
}

/** GET /analytics/:siteId/top-products — most-clicked products in a date boundary. */
async function topProducts(req, res, next) {
    try{
        const {siteId} = req.params;
        const {startDate, endDate, limit} = req.query;
        const userId = req.user.id;
        const data = await getTopProducts(siteId, userId, {startDate, endDate, limit: Number(limit) || 10});

        res.json({data})
    } catch (err) {
        next(err);
    }
}

/** GET /analytics/:siteId/top-referrers — top traffic sources in a date boundary. */
async function topReferrers(req, res, next) {
    try {
        const {siteId} = req.params;
        const {startDate, endDate, limit} = req.query;
        const userId = req.user.id;
        const data = await getTopReferrersService(siteId, userId, {startDate, endDate, limit: Number(limit) || 10});

        res.json({data});
    } catch (err) {
        next(err)
    }
}

/** GET /public/dashboard/:token — site name for the public dashboard header. Deliberately minimal: no domain, apiKey, or owner info. */
async function getPublicSiteController(req, res, next) {
    try {
        const {token} = req.params;
        const site = await getSiteByPublicToken(token);

        res.status(200).json({site: {name: site.name}});
    } catch (error) {
        next(error);
    }
}

/** GET /public/dashboard/:token/summary — same shape as getSummaryController, authorized by share token instead of a session. */
async function getPublicSummaryController(req, res, next) {
    try {
        const {token} = req.params;
        const {range} = req.query;
        const {startDate, endDate} = getDateRangeFromQuery(range);

        // getPublicSummary already resolves + authorizes the token once
        // internally — reusing the site it hands back instead of resolving
        // a second time avoids both a redundant DB round trip and a race
        // where a second resolution could see the link get disabled between
        // the two calls and discard summary data that was already fetched.
        const {summary, site} = await getPublicSummary({token, startDate, endDate});
        const dataAsOf = await getLastFlushAt(site.id);

        res.status(200).json({summary, dataAsOf});
    } catch (error) {
        next(error);
    }
}

/** GET /public/dashboard/:token/traffic — same shape as getTrafficController, authorized by share token instead of a session. */
async function getPublicTrafficController(req, res, next) {
    try {
        const {token} = req.params;
        const {range} = req.query;
        const {startDate, endDate} = getDateRangeFromQuery(range);

        // Same reuse-not-re-resolve reasoning as getPublicSummaryController.
        const {traffic, site} = await getPublicTrafficOverview({token, startDate, endDate});
        const dataAsOf = await getLastFlushAt(site.id);

        res.status(200).json({traffic, dataAsOf});
    } catch (error) {
        next(error);
    }
}

/** GET /public/dashboard/:token/top-products */
async function publicTopProducts(req, res, next) {
    try {
        const {token} = req.params;
        const {startDate, endDate, limit} = req.query;
        const data = await getPublicTopProducts(token, {startDate, endDate, limit: Number(limit) || 10});

        res.json({data});
    } catch (err) {
        next(err);
    }
}

/** GET /public/dashboard/:token/top-referrers */
async function publicTopReferrers(req, res, next) {
    try {
        const {token} = req.params;
        const {startDate, endDate, limit} = req.query;
        const data = await getPublicTopReferrers(token, {startDate, endDate, limit: Number(limit) || 10});

        res.json({data});
    } catch (err) {
        next(err);
    }
}

module.exports = {
    getTrafficController, getSummaryController, topProducts, topReferrers,
    getPublicSiteController, getPublicSummaryController, getPublicTrafficController, publicTopProducts, publicTopReferrers,
}
