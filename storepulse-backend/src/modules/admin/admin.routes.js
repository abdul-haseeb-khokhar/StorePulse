const express = require('express');
const {
    updateUserStatusController, listUsersController, getUserDetailController, listSitesController,
    getPlatformStatsController, setUserPlanController, listPaymentRequestsController, reviewPaymentRequestController,
    listOverLimitUsersController, listAdminLogsController, getUserBillingHistoryController,
} = require('./admin.controller');
const protectAdmin = require('../../middleware/protectAdmin');
const requireSuperAdmin = require('../../middleware/requireSuperAdmin');
const validate = require('../../middleware/validate');
const {
    updateUserStatusSchema, userIdParamSchema, listUsersSchema, listSitesSchema, setUserPlanSchema,
    listPaymentRequestsSchema, reviewPaymentRequestSchema, listAdminLogsSchema, userBillingHistorySchema,
} = require('../../validators/admin.validator');

const router = express.Router();

router.use(protectAdmin);

router.get('/stats', getPlatformStatsController);

router.get('/users', validate(listUsersSchema), listUsersController);
// Must come before /users/:id — otherwise Express matches "over-limit" as
// the :id param first, and userIdParamSchema rejects it as an invalid UUID.
router.get('/users/over-limit', listOverLimitUsersController);
router.get('/users/:id', validate(userIdParamSchema), getUserDetailController);
router.patch('/users/:id/status', validate(updateUserStatusSchema), updateUserStatusController);
router.patch('/users/:id/plan', validate(setUserPlanSchema), setUserPlanController);
router.get('/users/:id/history', validate(userBillingHistorySchema), getUserBillingHistoryController);

router.get('/sites', validate(listSitesSchema), listSitesController);

router.get('/payment-requests', validate(listPaymentRequestsSchema), listPaymentRequestsController);
router.patch('/payment-requests/:id', validate(reviewPaymentRequestSchema), reviewPaymentRequestController);

router.get('/logs', requireSuperAdmin, validate(listAdminLogsSchema), listAdminLogsController);

module.exports = router;
