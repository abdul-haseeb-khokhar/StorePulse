const rateLimit = require('express-rate-limit');
const { createRedisStore } = require('./rateLimitStore');

// Keyed on the attempted email — the actual attack target. Stricter than the
// IP limit because rotating proxies/IPs doesn't reset this one.
const loginRateLimiterByAccount = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    store: createRedisStore('rl:login:account:'),
    keyGenerator: (req) => (req.body?.email ? String(req.body.email).toLowerCase() : req.ip),
    handler: (req, res) => {
        res.status(429).json({ message: 'Too many login attempts. Please try again later.' });
    },
});

// Keyed on IP — catches a single script/bot hammering the endpoint. Looser
// than the account limit so one shared office/NAT IP isn't punished for one
// person's mistyped password.
const loginRateLimiterByIp = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    store: createRedisStore('rl:login:ip:'),
    handler: (req, res) => {
        res.status(429).json({ message: 'Too many login attempts. Please try again later.' });
    },
});

module.exports = { loginRateLimiterByIp, loginRateLimiterByAccount };
