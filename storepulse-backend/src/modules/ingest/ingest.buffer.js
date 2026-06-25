const path = require('path');
const fs = require('fs')
const { event } = require('../../config/prisma');
const { createManyEvents } = require('./ingest.repository');
const { resolve } = require('dns');

let buffer = [];

const FLUSH_INTERVAL_MS = 5000;
const MAX_BUFFER_SIZE = 500;
const MAX_RETRIES = 3;
const FAILED_EVENTS_LOG = path.join(__dirname, 'failed-events.log')

function addToBuffer(event){
    console.log('Add to buffer is called')
    buffer.push(event);

    if(buffer.length >= MAX_BUFFER_SIZE) {
        flushBuffer();
    }
}

async function flushBuffer(){
    console.log('FlushBuffer is called')
    if(buffer.length === 0) return;

    const eventsToWrite = buffer;
    buffer = [];

    await writesWithRetry(eventsToWrite, MAX_RETRIES);
}

async function writesWithRetry(events, attemptsLeft) {
    console.log('Wirteswithretry is called')
    try{
        await createManyEvents(events);
    } catch(error) {
        if(attemptsLeft>0) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            return writesWithRetry(events, attemptsLeft-1)
        }

        saveFailedEvents(events)
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