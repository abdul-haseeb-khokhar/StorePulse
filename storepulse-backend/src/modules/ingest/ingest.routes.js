/**
 * Ingest module routes. Public (no auth) but rate-limited — see
 * middleware/ingestRateLimiter.js.
 */
const express = require('express');
const {recordEventController} = require('./ingest.controller');
const validate = require('../../middleware/validate');;
const { trackEventSchema } = require('../../validators/ingest.validator');
const ingestRateLimiter = require('../../middleware/ingestRateLimiter');
const router = express.Router();

router.post('/', ingestRateLimiter, validate(trackEventSchema), recordEventController);

module.exports = router;
