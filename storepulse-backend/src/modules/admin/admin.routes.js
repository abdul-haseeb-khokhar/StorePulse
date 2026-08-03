const express = require('express');
const {updateUserStatusController, listUsersController, getUserDetailController, listSitesController, getPlatformStatsController} = require('./admin.controller');
const protectAdmin = require('../../middleware/protectAdmin');
const validate = require('../../middleware/validate');
const {updateUserStatusSchema, userIdParamSchema, listUsersSchema, listSitesSchema} = require('../../validators/admin.validator');

const router = express.Router();

router.use(protectAdmin);

router.get('/stats', getPlatformStatsController);

router.get('/users', validate(listUsersSchema), listUsersController);
router.get('/users/:id', validate(userIdParamSchema), getUserDetailController);
router.patch('/users/:id/status', validate(updateUserStatusSchema), updateUserStatusController);

router.get('/sites', validate(listSitesSchema), listSitesController);

module.exports = router;
