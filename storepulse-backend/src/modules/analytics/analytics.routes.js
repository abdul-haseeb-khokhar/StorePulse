const express = require('express');
const {getTrafficController, getSummaryController} = require('./analytics.controller');
const protect = require('../../middleware/protect');

const router = express.Router();

router.use(protect);

router.get('/:siteId/summary', getSummaryController);
router.get("/:siteId/traffic", getTrafficController);

module.exports = router;