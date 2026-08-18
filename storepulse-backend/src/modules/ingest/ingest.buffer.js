/**
 * Write-behind buffer for incoming events: events land in a Redis list
 * first and are flushed to Postgres in batches (by size or on a timer — see
 * the cron-style caller of flushBuffer), so a burst of ingest traffic never
 * hits the database as individual inserts.
 */
const path = require('path');
const fs = require('fs')
const { createManyEvents } = require('./ingest.repository');
const redisClient = require('../../config/redis');

const BUFFER_KEY = 'ingest:events:buffer';
const LAST_FLUSH_KEY_PREFIX = 'ingest:lastFlushAt:';
const FLUSH_INTERVAL_MS = 10000;
const MAX_BUFFER_SIZE = 500;
const MAX_RETRIES = 3;
const FAILED_EVENTS_LOG = path.join(__dirname, 'failed-events.log')

/**
 * Analytics reads straight from Postgres, but events sit in the Redis
 * buffer above for up to FLUSH_INTERVAL_MS (or until MAX_BUFFER_SIZE is hit)
 * before landing there. This timestamp — set per site, only on a successful
 * write, not on a failed one — lets the analytics API tell callers exactly
 * how fresh THAT SITE's numbers are, instead of silently implying they're
 * live or reporting the shared buffer's activity across every site at once.
 *
 * @param {string} siteId
 * @returns {Promise<string|null>} ISO timestamp of the site's last successful flush, or null if it's never flushed.
 */
async function getLastFlushAt(siteId) {
    return redisClient.get(`${LAST_FLUSH_KEY_PREFIX}${siteId}`);
}

/** Pushes one event into the buffer, triggering an immediate flush if it's now full. */
async function addToBuffer(event){
    await redisClient.lpush(BUFFER_KEY, JSON.stringify(event));

    const bufferLength = await redisClient.llen(BUFFER_KEY);
    if(bufferLength >= MAX_BUFFER_SIZE) {
        flushBuffer();
    }
}

/** Drains up to MAX_BUFFER_SIZE buffered events into Postgres. */
async function flushBuffer(){
    const rawEvents = await redisClient.lrange(BUFFER_KEY, 0, MAX_BUFFER_SIZE - 1);

    if(rawEvents.length === 0) return null;

    const events = rawEvents.map(e => JSON.parse(e));

    await writesWithRetry(events, rawEvents.length , MAX_RETRIES);
}

/** Writes a batch to Postgres, retrying with a fixed backoff before falling back to disk logging. */
async function writesWithRetry(events, countToTrim, attemptsLeft) {
    try{
        await createManyEvents(events);

        // A single flush batches events from whatever sites happened to be
        // buffered together, so only the sites actually present in this
        // batch get their clock updated — sites with nothing pending here
        // keep whatever timestamp they already had.
        const flushedSiteIds = [...new Set(events.map((e) => e.siteId))];
        const now = new Date().toISOString();
        await Promise.all(
            flushedSiteIds.map((siteId) => redisClient.set(`${LAST_FLUSH_KEY_PREFIX}${siteId}`, now))
        );

        await redisClient.ltrim(BUFFER_KEY, countToTrim, -1);
    } catch(error) {
        if(attemptsLeft>0) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            return writesWithRetry(events, countToTrim, attemptsLeft-1)
        }
        await redisClient.ltrim(BUFFER_KEY, countToTrim, -1);
        saveFailedEvents(events);
    }
}

/** Last resort when Postgres writes keep failing: append the batch to a local log instead of losing it. */
function saveFailedEvents(events) {
    const line = JSON.stringify({failedAt: new Date().toISOString(), events}) + "\n";
    fs.appendFile(FAILED_EVENTS_LOG, line, (err) => {
        if(err) console.error('Could not even save failed events to disk: ', err.message)
    });
}

module.exports= {
    addToBuffer, flushBuffer, getLastFlushAt
}
