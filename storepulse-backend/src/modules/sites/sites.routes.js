/**
 * Sites module routes. All require a logged-in user.
 */
const express = require('express')
const router = express.Router()

const validate = require('../../middleware/validate');
const {addSiteSchema, siteIdParamSchema, publicAccessSchema} = require('../../validators/sites.validator');
const {
    addSiteController, getSiteByIdController, regenerateApiKeyController, getUserSitesController, getUsageSummaryController,
    setPublicAccessController, regeneratePublicTokenController,
} = require('./sites.controller')
const protect = require('../../middleware/protect')

router.use(protect)

router.post('/', validate(addSiteSchema), addSiteController);
router.get('/', getUserSitesController)
// Must come before /:siteId — otherwise Express matches "usage" as a
// siteId first, and siteIdParamSchema rejects it as an invalid UUID.
router.get('/usage', getUsageSummaryController)
router.get('/:siteId',validate(siteIdParamSchema), getSiteByIdController)
router.patch('/:siteId/api-key',validate(siteIdParamSchema), regenerateApiKeyController)
router.patch('/:siteId/public-access', validate(publicAccessSchema), setPublicAccessController)
router.patch('/:siteId/public-access/regenerate', validate(siteIdParamSchema), regeneratePublicTokenController)

module.exports = router;
