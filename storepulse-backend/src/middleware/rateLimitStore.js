const { RedisStore } = require('rate-limit-redis');
const redisClient = require('../config/redis');

// rate-limit-redis expects a generic "sendCommand" function; this bridges it
// onto our existing ioredis client instead of opening a second connection.
// Shared across every rate limiter (login, admin login, ingest, ...) so the
// wiring only lives in one place.
function createRedisStore(prefix) {
    return new RedisStore({
        sendCommand: (...args) => redisClient.call(...args),
        prefix,
    });
}

module.exports = { createRedisStore };
