const {recordEvent} = require('./ingest.service')

async function recordEventController(req, res, next) {
    console.log('recordevent controller is called')
    try {
        const {apiKey, type, pageUrl, referrer, productId, productName} = req.body;

        await recordEvent({apiKey, type, pageUrl, referrer, productId, productName});

        res.status(202).json({message: 'Event Accepted'})
    } catch(error) {
        next(error)
    }
}

module.exports = {
    recordEventController
}