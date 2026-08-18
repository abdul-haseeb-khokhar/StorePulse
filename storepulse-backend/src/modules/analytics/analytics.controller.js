/**
 * HTTP layer for the analytics module: per-site traffic, summary, and
 * top-products/top-referrers endpoints.
 */
const {getTrafficOverview, getSummary, getTopProducts, getTopReferrersService} = require('./analytics.service');
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


module.exports = {
    getTrafficController, getSummaryController, topProducts, topReferrers
}
