const {getTrafficOverview, getSummary} = require('./analytics.service');

function getDateRangeFromQuery(range) {
    const endDate = new Date();
    const startDate = new Date();

    const days = {'7d' : 7, '30d' : 30, '90d' : 90} [range] || 30;
    startDate.setDate(startDate.getDate() - days);

    return {startDate, endDate}
}

async function getTrafficController(req, res, next) {
    try {
        const {siteId} = req.params;
        const {range} = req.query;
        const userId = req.user.id;

        const {startDate, endDate} = getDateRangeFromQuery(range);

        const traffic = await getTrafficOverview({siteId, userId, startDate, endDate});

        res.status(200).json({traffic});

    } catch (error) {
        console.log(error)
        next(error);        
    }
}

async function getSummaryController(req, res, next) {
    try {
        const {siteId} = req.params;
        const { range } = req.query;
        const userId = req.user.id;

        const {startDate, endDate} = getDateRangeFromQuery(range);

        const summary = await getSummary({siteId, userId, startDate, endDate});
        res.status(200).json({summary});
    } catch (error) {
        next(error)
    }
}

module.exports = {
    getTrafficController, getSummaryController
}