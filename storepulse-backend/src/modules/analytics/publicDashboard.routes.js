/**
 * Public (no-auth) dashboard routes: the read-only view a site owner shares
 * via a link (turned on/off from SiteSettings.jsx, see sites.routes.js's
 * /public-access endpoints), keyed on Site.publicToken instead of a
 * logged-in session. Every route here is reachable by anyone who has the
 * link — see sites.service.js's getSiteByPublicToken for exactly what that
 * link can and can't see (site name + aggregate analytics only, never
 * domain/apiKey/owner info), and publicDashboardRateLimiter for the abuse
 * guard an anonymous endpoint needs that the authenticated analytics
 * routes don't.
 */
const express = require('express');
const {
    getPublicSiteController, getPublicSummaryController, getPublicTrafficController,
    publicTopProducts, publicTopReferrers,
} = require('./analytics.controller');
const validate = require('../../middleware/validate');
const publicDashboardRateLimiter = require('../../middleware/publicDashboardRateLimiter');
const {
    publicTokenParamSchema, publicRangeQuerySchema, publicDateBoundaryQuerySchema,
} = require('../../validators/analytics.validator');

const router = express.Router();

router.use(publicDashboardRateLimiter);

router.get('/:token', validate(publicTokenParamSchema), getPublicSiteController);
router.get('/:token/summary', validate(publicRangeQuerySchema), getPublicSummaryController);
router.get('/:token/traffic', validate(publicRangeQuerySchema), getPublicTrafficController);
router.get('/:token/top-products', validate(publicDateBoundaryQuerySchema), publicTopProducts);
router.get('/:token/top-referrers', validate(publicDateBoundaryQuerySchema), publicTopReferrers);

module.exports = router;
