/**
 * Analytics module routes. All require a logged-in user; ownership and
 * plan-eligibility of the target site are enforced in the service layer.
 */
const express = require('express');
const {getTrafficController, getSummaryController, topProducts, topReferrers} = require('./analytics.controller');
const protect = require('../../middleware/protect');
const validate = require('../../middleware/validate');
const {rangeQuerySchema, dateBoundaryQuerySchema} = require('../../validators/analytics.validator');

const router = express.Router();

router.use(protect);

router.get('/:siteId/summary',validate(rangeQuerySchema), getSummaryController);
router.get("/:siteId/traffic", validate(rangeQuerySchema), getTrafficController);
router.get("/:siteId/top-products", validate(dateBoundaryQuerySchema), topProducts);
router.get("/:siteId/top-referrers", validate(dateBoundaryQuerySchema), topReferrers);

module.exports = router;
