const rateLimit = require('express-rate-limit');
const { createRedisStore } = require('./rateLimitStore');

// Same shape as the regular login limiter, but stricter — admin accounts are
// a higher-value target, so both the account and IP ceilings are tighter.

// Keyed on the attempted email. The real defense — rotating IPs doesn't reset this.
const adminLoginRateLimiterByAccount = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 3,
    standardHeaders: true,
    legacyHeaders: false,
    store: createRedisStore('rl:adminLogin:account:'),
    keyGenerator: (req) => (req.body?.email ? String(req.body.email).toLowerCase() : req.ip),
    handler: (req, res) => {
        res.status(429).json({ message: 'Too many login attempts. Please try again later.' });
    },
});

// Keyed on IP. Catches a single script/bot hammering the endpoint.
const adminLoginRateLimiterByIp = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    store: createRedisStore('rl:adminLogin:ip:'),
    handler: (req, res) => {
        res.status(429).json({ message: 'Too many login attempts. Please try again later.' });
    },
});

module.exports = { adminLoginRateLimiterByIp, adminLoginRateLimiterByAccount };
