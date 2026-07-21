const express = require('express');
const {getTrafficController, getSummaryController, topProducts, topReferrers} = require('./analytics.controller');
const protect = require('../../middleware/protect');
const validate = require('../../middleware/validate');
const {siteIdParamSchema} = require('../../validators/sites.validator');

const router = express.Router();

router.use(protect);

router.get('/:siteId/summary',validate(siteIdParamSchema), getSummaryController);
router.get("/:siteId/traffic", validate(siteIdParamSchema), getTrafficController);
router.get("/:siteId/top-products", validate(siteIdParamSchema), topProducts);
router.get("/:siteId/top-referrers", validate(siteIdParamSchema), topReferrers);

module.exports = router;