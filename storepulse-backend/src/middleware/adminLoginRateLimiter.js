/**
 * Rate limiters for the admin login endpoint. Same shape as the regular
 * login limiter, but stricter — admin accounts are a higher-value target,
 * so both the account and IP ceilings are tighter.
 */
const rateLimit = require('express-rate-limit');
const { ipKeyGenerator } = require('express-rate-limit');
const { createRedisStore } = require('./rateLimitStore');

// Keyed on the attempted email — the real defense, since rotating IPs
// doesn't reset this one.
const adminLoginRateLimiterByAccount = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 3,
    standardHeaders: true,
    legacyHeaders: false,
    store: createRedisStore('rl:adminLogin:account:'),
    keyGenerator: (req) => (req.body?.email ? String(req.body.email).toLowerCase() : ipKeyGenerator(req.ip)),
    handler: (req, res) => {
        res.status(429).json({ message: 'Too many login attempts. Please try again later.' });
    },
});

// Keyed on IP — catches a single script/bot hammering the endpoint.
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
