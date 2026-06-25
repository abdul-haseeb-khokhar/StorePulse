const express = require('express');
const {recordEventController} = require('./ingest.controller');

const router = express.Router();

router.post('/', recordEventController);

module.exports = router;