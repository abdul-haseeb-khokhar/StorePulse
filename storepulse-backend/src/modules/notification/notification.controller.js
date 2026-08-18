/**
 * HTTP layer for in-app notifications: the reader side the notification
 * bell polls.
 */
const {listMyNotifications, markMyNotificationRead, markAllMyNotificationsRead} = require('./notification.service');

/** GET /notifications — paginated list plus unread count, for the notification bell. */
async function listMyNotificationsController(req, res, next) {
    try {
        const {page, limit} = req.query;
        const result = await listMyNotifications(req.user.id, {page, limit});

        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
}

/** PATCH /notifications/:id/read */
async function markMyNotificationReadController(req, res, next) {
    try {
        const {id} = req.params;
        await markMyNotificationRead(id, req.user.id);

        res.status(200).json({message: 'Notification marked as read'});
    } catch (error) {
        next(error);
    }
}

/** PATCH /notifications/read-all */
async function markAllMyNotificationsReadController(req, res, next) {
    try {
        await markAllMyNotificationsRead(req.user.id);

        res.status(200).json({message: 'All notifications marked as read'});
    } catch (error) {
        next(error);
    }
}

module.exports = {listMyNotificationsController, markMyNotificationReadController, markAllMyNotificationsReadController};
