const express = require('express')
const {signUpController, loginController, meController} = require('./auth.controller')
const protect = require("../../middleware/protect")
const {registerSchema, loginSchema} = require('../../validators/auth.validator');
const validate = require('../../middleware/validate');

const router = express.Router()

router.post('/signup',validate(registerSchema), signUpController);
router.post('/login', validate(loginSchema), loginController);
router.get('/me', protect, meController);

module.exports = router;