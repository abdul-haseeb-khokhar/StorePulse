const Redis = require('ioredis');

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

const redisClient = new Redis(redisUrl,{
    retryStrategy(times) {
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