const {inviteAdmin, acceptInvite, loginAdmin, listAdminsService} = require('./adminAuth.service');

async function inviteAdminController(req, res, next) {
    try {
        const {email} = req.body;
        const result = await inviteAdmin(email);

        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
}

async function acceptInviteController(req, res, next) {
    try {
        const {token, fullName, password} = req.body;
        const result = await acceptInvite(token, fullName, password);

        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
}

async function loginAdminController(req, res, next) {
    try {
        const {email, password} = req.body;
        const result = await loginAdmin(email, password);

        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
}

async function listAdminsController(req, res, next) {
    try {
        const admins = await listAdminsService();

        res.status(200).json({admins});
    } catch (error) {
        next(error);
    }
}

module.exports = {inviteAdminController, acceptInviteController, loginAdminController, listAdminsController}
