const express = require('express')
const {signUpController, loginController, meController, updateNameController, updatePasswordController,
    verifyEmailController, resendVerificationController, requestEmailChangeController, confirmEmailChangeController,
    forgotPasswordController,
    resetPasswordController
} = require('./auth.controller')
const protect = require("../../middleware/protect")
const {registerSchema, loginSchema, changeNameSchema, changePasswordSchema, resendVerificationSchema, requestEmailChangeSchema, forgotPasswordSchema, resetPasswordSchema, verifyEmailSchema, confirmEmailChangeSchema} = require('../../validators/auth.validator');
const validate = require('../../middleware/validate');
const {loginRateLimiterByIp, loginRateLimiterByAccount} = require('../../middleware/loginRateLimiter');

const router = express.Router()

router.post('/signup',validate(registerSchema), signUpController);
router.post('/login', loginRateLimiterByIp, loginRateLimiterByAccount, validate(loginSchema), loginController);

router.get('/verify-email', validate(verifyEmailSchema), verifyEmailController);
router.post('/resend-verification', validate(resendVerificationSchema), resendVerificationController);

router.get('/me', protect, meController);
router.patch('/me/name',validate(changeNameSchema), protect, updateNameController);
router.patch('/me/password',validate(changePasswordSchema), protect, updatePasswordController);
router.post('/me/email', validate(requestEmailChangeSchema), protect, requestEmailChangeController);
router.get('/confirm-email-change', validate(confirmEmailChangeSchema), confirmEmailChangeController);

router.post('/forgot-password', validate(forgotPasswordSchema), forgotPasswordController);
router.post('/reset-password', validate(resetPasswordSchema), resetPasswordController);

module.exports = router;