/**
 * Rate limiter for the public (no-auth) dashboard routes. A real page load
 * fires several requests at once (site info + summary + traffic +
 * top-products + top-referrers) plus occasional manual refreshes — this
 * only needs to catch scripted scraping of a leaked/guessed link, not
 * throttle someone actually looking at the page. Same token-bucket shape
 * as ingestRateLimiter, keyed per-IP for the same reason: the visitors
 * hitting this are anonymous browsers, not the site owner's account.
 */
const { RateLimiterRedis } = require('rate-limiter-flexible');
const redisClient = require('../config/redis');

const publicDashboardLimiter = new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: 'rl:public-dashboard',
    points: 40,   // bucket capacity (a couple of page loads/refreshes in a burst)
    duration: 10, // full bucket refills every 10s -> ~4 points/sec sustained
});

/**
 * Express middleware that enforces the public-dashboard token bucket per
 * client IP. Responds 429 with Retry-After when the bucket is empty.
 */
async function publicDashboardRateLimiter(req, res, next) {
    try {
        await publicDashboardLimiter.consume(req.ip);
        next();
    } catch (rejection) {
        // Same distinction as ingestRateLimiter: consume() rejects with a
        // RateLimiterRes when the limit is hit, but with a real Error on
        // something unexpected (e.g. Redis hiccup) — only the former should
        // be treated as "too many requests".
        if (rejection instanceof Error) {
            return next(rejection);
        }
        res.set('Retry-After', String(Math.ceil(rejection.msBeforeNext / 1000)));
        res.status(429).json({ message: 'Too many requests, slow down.' });
    }
}

module.exports = publicDashboardRateLimiter;
