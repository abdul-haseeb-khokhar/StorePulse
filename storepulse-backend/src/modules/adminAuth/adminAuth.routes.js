/**
 * Admin auth routes. Login is rate-limited by IP and by account; invite
 * management is superadmin-only.
 */
const express = require('express');
const {inviteAdminController, acceptInviteController, loginAdminController, listAdminsController} = require('./adminAuth.controller');
const protectAdmin = require('../../middleware/protectAdmin');
const requireSuperAdmin = require('../../middleware/requireSuperAdmin');
const validate = require('../../middleware/validate');
const {inviteAdminSchema, acceptInviteSchema, adminLoginSchema} = require('../../validators/adminAuth.validator');
const {adminLoginRateLimiterByIp, adminLoginRateLimiterByAccount} = require('../../middleware/adminLoginRateLimiter');

const router = express.Router();

router.post('/login', adminLoginRateLimiterByIp, adminLoginRateLimiterByAccount, validate(adminLoginSchema), loginAdminController);
router.post('/accept-invite', validate(acceptInviteSchema), acceptInviteController);

router.post('/invite', protectAdmin, requireSuperAdmin, validate(inviteAdminSchema), inviteAdminController);
router.get('/admins', protectAdmin, requireSuperAdmin, listAdminsController);

module.exports = router;
