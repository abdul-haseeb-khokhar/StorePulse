/**
 * Redis-backed monthly event counter per site, used to enforce
 * maxMonthlyEvents and to show usage on the site owner's own dashboard.
 */
const redisClient = require('../../config/redis');

const USAGE_KEY_PREFIX = 'usage:events:';

/**
 * Seconds from now until the first moment of next month (UTC), plus a
 * one-day buffer — used as the counter's TTL so a month's key cleans
 * itself up shortly after that month is over instead of lingering in
 * Redis forever waiting for a sweep that doesn't exist.
 */
function secondsUntilNextMonth() {
    const now = new Date();
    const nextMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
    return Math.ceil((nextMonth.getTime() - now.getTime()) / 1000) + 24 * 60 * 60;
}

function monthlyUsageKey(siteId) {
    const now = new Date();
    const month = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
    return `${USAGE_KEY_PREFIX}${siteId}:${month}`;
}

/**
 * Atomically increments this site's event count for the current calendar
 * month and returns the new total. INCR is what makes this safe under
 * concurrent requests — the expiry is only set on the first increment of
 * the month (count === 1) so a later call can't keep resetting the TTL and
 * making the key immortal.
 *
 * @param {string} siteId
 * @returns {Promise<number>} The site's event count so far this month, including this one.
 */
async function incrementMonthlyEventCount(siteId) {
    const key = monthlyUsageKey(siteId);
    const count = await redisClient.incr(key);
    if (count === 1) {
        await redisClient.expire(key, secondsUntilNextMonth());
    }
    return count;
}

/**
 * Read-only counterpart for surfacing usage (e.g. the site owner's own
 * dashboard) — doesn't touch the counter, so checking it never itself
 * counts as an event. A month with no events yet simply has no key.
 *
 * @param {string} siteId
 * @returns {Promise<number>}
 */
async function getMonthlyEventCount(siteId) {
    const count = await redisClient.get(monthlyUsageKey(siteId));
    return count ? Number(count) : 0;
}

module.exports = {incrementMonthlyEventCount, getMonthlyEventCount};
