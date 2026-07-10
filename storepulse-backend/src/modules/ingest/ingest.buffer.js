const path = require('path');
const fs = require('fs')
const { createManyEvents } = require('./ingest.repository');
const redisClient = require('../../config/redis');

const BUFFER_KEY = 'ingest:events:buffer';
const FLUSH_INTERVAL_MS = 10000;
const MAX_BUFFER_SIZE = 500;
const MAX_RETRIES = 3;
const FAILED_EVENTS_LOG = path.join(__dirname, 'failed-events.log')

async function addToBuffer(event){
    console.log('Add to buffer is called')
    await redisClient.lpush(BUFFER_KEY, JSON.stringify(event));

    const bufferLength = await redisClient.llen(BUFFER_KEY);
    if(bufferLength >= MAX_BUFFER_SIZE) {
        flushBuffer();
    }
}

async function flushBuffer(){
    console.log('FlushBuffer is called')

    const rawEvents = await redisClient.lrange(BUFFER_KEY, 0, MAX_BUFFER_SIZE - 1);
    console.log(rawEvents)
    
    if(rawEvents.length === 0) return null;

    const events = rawEvents.map(e => JSON.parse(e));

    await writesWithRetry(events, rawEvents.length , MAX_RETRIES);
}

async function writesWithRetry(events, countToTrim, attemptsLeft) {
    console.log('Wirteswithretry is called')
    try{
        await createManyEvents(events);
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

function saveFailedEvents(events) {
    console.log('saveFailedEvents is called')
    const line = JSON.stringify({failedAt: new Date().toISOString(), events}) + "\n";
    fs.appendFile(FAILED_EVENTS_LOG, line, (err) => {
        if(err) console.error('Could not even save failed events to disk: ', err.message)
    });
}

setInterval(flushBuffer, FLUSH_INTERVAL_MS);

module.exports= {
    addToBuffer, flushBuffer
}