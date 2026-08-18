/**
 * Rate limiter for the public event-ingest endpoint. Unlike the login
 * limiters, this guards against abusive traffic volume rather than
 * credential-guessing, so it's a token bucket rather than a fixed window.
 */
const { RateLimiterRedis } = require('rate-limiter-flexible');
const redisClient = require('../config/redis');

// Token bucket, keyed per-IP (the shopper's browser, not the store). A real
// browser firing a few events on one page load fits comfortably in the
// 30-point burst; sustained ~10/sec per IP is far beyond anything a real
// visitor could produce, but low enough to stop a script blasting fake
// events from one machine.
//
// Deliberately NOT keyed per-site/API-key: a popular store's real traffic is
// the sum of thousands of different shoppers' IPs, so capping by site would
// throttle real growth instead of catching abuse.
const ingestLimiter = new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: 'rl:ingest',
    points: 30,   // bucket capacity (burst allowance)
    duration: 3,  // full bucket refills every 3s -> ~10 points/sec sustained
});

/**
 * Express middleware that enforces the ingest token bucket per client IP.
 * Responds 429 with Retry-After when the bucket is empty.
 */
async function ingestRateLimiter(req, res, next) {
    try {
        await ingestLimiter.consume(req.ip);
        next();
    } catch (rejection) {
        // consume() rejects with a RateLimiterRes when the limit is hit, but
        // with a real Error on something unexpected (e.g. Redis hiccup) —
        // only the former should be treated as "too many requests".
        if (rejection instanceof Error) {
            return next(rejection);
        }
        res.set('Retry-After', String(Math.ceil(rejection.msBeforeNext / 1000)));
        res.status(429).json({ message: 'Too many requests, slow down.' });
    }
}

module.exports = ingestRateLimiter;
