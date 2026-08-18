/**
 * Notification module routes. All require a logged-in user.
 */
const express = require('express');
const {
    listMyNotificationsController, markMyNotificationReadController, markAllMyNotificationsReadController,
} = require('./notification.controller');
const protect = require('../../middleware/protect');
const validate = require('../../middleware/validate');
const {paginationSchema, notificationIdParamSchema} = require('../../validators/notification.validator');

const router = express.Router();

router.use(protect);

router.get('/', validate(paginationSchema), listMyNotificationsController);
router.patch('/read-all', markAllMyNotificationsReadController);
router.patch('/:id/read', validate(notificationIdParamSchema), markMyNotificationReadController);

module.exports = router;
