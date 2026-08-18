/**
 * Shared Redis client used by the rate limiters and ingest buffering.
 * Configured with a bounded reconnect/backoff strategy and logging on every
 * lifecycle event so connection issues in production show up in the logs
 * instead of failing silently.
 */
const Redis = require('ioredis');

const redisUrl = process.env.REDIS_URL;

const redisClient = new Redis(redisUrl,{
    retryStrategy(times) {
        // Backs off linearly, capped at 10s, rather than retrying instantly
        // forever or giving up — keeps reconnect attempts from hammering
        // Redis during an outage.
        const delay = Math.min(times * 500, 10000);
        console.warn(`Redis reconnect attempt ${times}, retrying in ${delay}ms`);
        return delay;
    },
    maxRetriesPerRequest: 3,
    enableOfflineQueue: true,
})

redisClient.on('connect', () => {
    console.log('Redis Connected');
});

redisClient.on('ready', () => {
    console.log('Redis Ready');
});

redisClient.on('error', (err) => {
    console.error("Redis Error: ", err)
});

redisClient.on('reconnecting', (delay) => {
    console.log(`Redis reconnecting in ${delay}ms`);
});

redisClient.on('close', ()=> {
    console.warn('Redis connection closed');
});

module.exports = redisClient;
