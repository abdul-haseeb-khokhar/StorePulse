const express = require('express');
const {inviteAdminController, acceptInviteController, loginAdminController, listAdminsController} = require('./adminAuth.controller');
const protectAdmin = require('../../middleware/protectAdmin');
const requireSuperAdmin = require('../../middleware/requireSuperAdmin');
const validate = require('../../middleware/validate');
const {inviteAdminSchema, acceptInviteSchema, adminLoginSchema} = require('../../validators/adminAuth.validator');

const router = express.Router();

router.post('/login', validate(adminLoginSchema), loginAdminController);
router.post('/accept-invite', validate(acceptInviteSchema), acceptInviteController);

router.post('/invite', protectAdmin, requireSuperAdmin, validate(inviteAdminSchema), inviteAdminController);
router.get('/admins', protectAdmin, requireSuperAdmin, listAdminsController);

module.exports = router;
