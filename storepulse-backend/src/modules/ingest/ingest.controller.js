/**
 * HTTP layer for the public event-ingest endpoint.
 */
const {recordEvent} = require('./ingest.service')

/** POST /events — accepts one tracked event from a storefront's embedded snippet. */
async function recordEventController(req, res, next) {
    try {
        const {apiKey, type, pageUrl, referrer, productId, productName, visitorId} = req.body;
        await recordEvent({apiKey, type, pageUrl, referrer, productId, productName, visitorId});

        res.status(202).json({message: 'Event Accepted'})
    } catch(error) {
        console.error(error)
        next(error)
    }
}

module.exports = {
    recordEventController
}
