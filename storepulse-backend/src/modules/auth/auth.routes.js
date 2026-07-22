const express = require('express')
const {signUpController, loginController, meController, updateNameController, updatePasswordController} = require('./auth.controller')
const protect = require("../../middleware/protect")
const {registerSchema, loginSchema, changeNameSchema, changePasswordSchema} = require('../../validators/auth.validator');
const validate = require('../../middleware/validate');

const router = express.Router()

router.post('/signup',validate(registerSchema), signUpController);
router.post('/login', validate(loginSchema), loginController);
router.get('/me', protect, meController);
router.patch('/me/name',validate(changeNameSchema), protect, updateNameController);
router.patch('/me/password',validate(changePasswordSchema), protect, updatePasswordController);

module.exports = router;