require('dotenv').config();
const  {flushBuffer} = require('./src/modules/ingest/ingest.buffer');

const FLUSH_INTERVAL_MS = 10000;

console.log('Flush worker started');

setInterval(async () => {
    try {
        await flushBuffer();
    } catch (error) {
        console.error('Unexpected error in flush loop: ', error);
    }
}, FLUSH_INTERVAL_MS);