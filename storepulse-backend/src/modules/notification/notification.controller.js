const {listMyNotifications, markMyNotificationRead, markAllMyNotificationsRead} = require('./notification.service');

async function listMyNotificationsController(req, res, next) {
    try {
        const {page, limit} = req.query;
        const result = await listMyNotifications(req.user.id, {page, limit});

        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
}

async function markMyNotificationReadController(req, res, next) {
    try {
        const {id} = req.params;
        await markMyNotificationRead(id, req.user.id);

        res.status(200).json({message: 'Notification marked as read'});
    } catch (error) {
        next(error);
    }
}

async function markAllMyNotificationsReadController(req, res, next) {
    try {
        await markAllMyNotificationsRead(req.user.id);

        res.status(200).json({message: 'All notifications marked as read'});
    } catch (error) {
        next(error);
    }
}

module.exports = {listMyNotificationsController, markMyNotificationReadController, markAllMyNotificationsReadController};
