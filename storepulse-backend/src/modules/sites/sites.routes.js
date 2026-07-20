const express = require('express')
const router = express.Router()

const validate = require('../../middleware/validate');
const {addSiteSchema, siteIdParamSchema} = require('../../validators/sites.validator');
const {addSiteController, getSiteByIdController, regenerateApiKeyController, getUserSitesController} = require('./sites.controller')
const protect = require('../../middleware/protect')

router.use(protect)

router.post('/', validate(addSiteSchema), addSiteController);
router.get('/', getUserSitesController)
router.get('/:siteId',validate(siteIdParamSchema), getSiteByIdController)
router.patch('/:siteId/api-key',validate(siteIdParamSchema), regenerateApiKeyController)

module.exports = router;

