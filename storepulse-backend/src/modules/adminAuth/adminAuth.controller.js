/**
 * HTTP layer for admin authentication: inviting admins, accepting an
 * invite, admin login, and listing admins.
 */
const {inviteAdmin, acceptInvite, loginAdmin, listAdminsService} = require('./adminAuth.service');

/** POST /admin/auth/invite — superadmin invites a new admin by email. */
async function inviteAdminController(req, res, next) {
    try {
        const {email} = req.body;
        const result = await inviteAdmin(email);

        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
}

/** POST /admin/auth/accept-invite — invited admin sets their name/password and activates. */
async function acceptInviteController(req, res, next) {
    try {
        const {token, fullName, password} = req.body;
        const result = await acceptInvite(token, fullName, password);

        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
}

/** POST /admin/auth/login — admin login, returns a JWT. */
async function loginAdminController(req, res, next) {
    try {
        const {email, password} = req.body;
        const result = await loginAdmin(email, password);

        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
}

/** GET /admin/auth/admins — superadmin-only list of all admin accounts. */
async function listAdminsController(req, res, next) {
    try {
        const admins = await listAdminsService();

        res.status(200).json({admins});
    } catch (error) {
        next(error);
    }
}

module.exports = {inviteAdminController, acceptInviteController, loginAdminController, listAdminsController}
