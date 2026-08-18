/**
 * Factory for the Redis-backed store shared by all express-rate-limit
 * instances (login, admin login, ...).
 */
const { RedisStore } = require('rate-limit-redis');
const redisClient = require('../config/redis');

/**
 * Builds a RedisStore for express-rate-limit under the given key prefix.
 * rate-limit-redis expects a generic "sendCommand" function; this bridges it
 * onto our existing ioredis client instead of opening a second connection.
 *
 * @param {string} prefix Redis key prefix, so each limiter's counters stay isolated.
 * @returns {RedisStore}
 */
function createRedisStore(prefix) {
    return new RedisStore({
        sendCommand: (...args) => redisClient.call(...args),
        prefix,
    });
}

module.exports = { createRedisStore };
