const prisma = require('../../config/prisma');

async function countPageViews({siteId, startDate, endDate}) {
    return prisma.event.count({
        where: {
            siteId,
            type: 'PAGE_VIEW',
            createdAt: {gte: startDate, lt: endDate},
        }
    })
}
async function countProductClicks({siteId, startDate, endDate}) {
    return prisma.event.count({
        where: {
            siteId,
            type: 'PRODUCT_CLICK',
            createdAt: {gte: startDate, lt: endDate}
        }
    })
}

async function countUniqueVisitors({siteId, startDate, endDate}) {
    const result = await prisma.$queryRaw`
    SELECT COUNT(DISTINCT "visitorId")::int AS count
    FROM "Event"
    WHERE "siteId" = ${siteId}
        AND "createdAt" >= ${startDate}
        AND "createdAt" < ${endDate}
        `;

    return result[0].count;
}

async function getDailyTraffic({siteId, startDate, endDate}){
    return prisma.$queryRaw`
    SELECT
        DATE_TRUNC('day', "createdAt")::date AS date,
        COUNT(*) FILTER(WHERE "type"= 'PAGE_VIEW' )AS visitors,
        COUNT(*) FILTER(WHERE "type" = 'PRODUCT_CLICK') AS clicks
    FROM "Event"
    WHERE "siteId" = ${siteId}
        AND "createdAt" >= ${startDate}
        AND "createdAt" < ${endDate}
    GROUP BY DATE_TRUNC('day', "createdAt")
    ORDER BY date ASC
    `;
}

async function getTopClickedProducts({siteId, startDate, endDate, limit = 10}) {
    return prisma.event.groupBy({
        by: ['productId', 'productName'],
        where: {
            siteId,
            type: 'PRODUCT_CLICK',
            createdAt: {gte: startDate, lte: endDate},
            productId: {not: null}
        },
        _count: {productId: true},
        orderBy: {_count: {productId: 'desc'}},
        take: limit,
    });
}

async function getTopReferrers({siteId, startDate, endDate, limit = 10}) {
    return prisma.event.groupBy({
        by: ['referrer'],
        where: {
            siteId,
            type: 'PAGE_VIEW',
            createdAt: {gte: startDate, lte: endDate},
        },

        _count: {referrer: true},
        orderBy: {_count: {referrer: 'desc'}},
        take: limit,
    })
}

module.exports= {
    countPageViews, countProductClicks, countUniqueVisitors, getDailyTraffic, getTopClickedProducts, getTopReferrers
}