const express = require('express');
const {recordEventController} = require('./ingest.controller');
const validate = require('../../middleware/validate');;
const { trackEventSchema } = require('../../validators/ingest.validator');
const router = express.Router();

router.post('/', validate(trackEventSchema), recordEventController);

module.exports = router;