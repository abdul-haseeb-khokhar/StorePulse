const express = require('express')
const router = express.Router()
const {addSiteController, getSiteByIdController, regenerateApiKeyController, getUserSitesController} = require('./sites.controller')
const protect = require('../../middleware/protect')

router.use(protect)

router.post('/', addSiteController )
router.get('/', getUserSitesController)
router.get('/:siteId', getSiteByIdController)
router.patch('/:siteId/api-key', regenerateApiKeyController)

module.exports = router;

