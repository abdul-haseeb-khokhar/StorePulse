const { getDailyTraffic, countPageViews, countProductClicks, countUniqueVisitors } = require(
    './analytics.repository'
)
const { getSiteById } = require('../sites/sites.service')
const {formateDateKey, buildDateRange} = require('../../utils/dateRange')

// This function manages the traffic on the site on daily basis
async function getTrafficOverview({ siteId, userId, startDate, endDate }) {
    await getSiteById({ siteId, userId });

    const rawResults = await getDailyTraffic({ siteId, startDate, endDate });

    const resultsByDate = new Map();
    rawResults.forEach((row) => {
        resultsByDate.set(formateDateKey(row.date), {
            visitors: Number(row.visitors),
            clicks: Number(row.clicks)
        });
    });

    const allDates = buildDateRange(startDate, endDate);

    return allDates.map((date) => {
        const dayData = resultsByDate.get(date);
        return {
            date,
            visitors: dayData ? dayData.visitors : 0,
            clicks: dayData ? dayData.clicks : 0
        }
    })
}

function getPreviousPeriod (startDate, endDate) {
    const periodLengthMs = endDate.getTime() - startDate.getTime();

    const previousEndDate = new Date(startDate)
    const previousStartDate = new Date(startDate.getTime()- periodLengthMs);

    return {previousEndDate, previousStartDate};
}

function calculatePercentChange(current, previous){
    if(previous === 0) {
        return current === 0 ? 0 : 100;
    }

    return Math.round(((current-previous)/previous) * 100);
}

async function getSummary({siteId, userId, startDate, endDate}) {
    await getSiteById({siteId, userId});

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

module.exports = {
    getTrafficOverview, getSummary
}