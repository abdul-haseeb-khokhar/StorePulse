/**
 * HTTP layer for regular user auth: signup/login, profile changes, and the
 * email verification / password reset flows.
 */
const {signUp, login, getUserById, changeName, changePassword, verifyEmail, resendVerification, requestEmailChange, confirmEmailChange, forgotPassword, resetPassword} = require('./auth.service')

/** POST /auth/signup */
async function signUpController(req, res, next) {
    try {
        const {fullName, email, password} = req.body;
        const result = await signUp(fullName, email, password);
        res.status(201).json(result)
    } catch (error) {
        next(error)
    }
}
/** POST /auth/login */
async function loginController(req, res, next) {
    try {
        const {email, password} = req.body;
        const result = await login(email, password);
        res.status(200).json(result)
    }
    catch(error){
        next(error)
    }
}

/** GET /auth/me — the logged-in user's profile and subscription. */
async function meController(req, res, next) {
    try{
        const user = await getUserById(req.user.id)
        res.status(200).json({user});
    } catch(error){
        next(error)
    }
}

/** PATCH /auth/me/name */
async function updateNameController(req, res, next) {
    try {
        const updated = await changeName(req.user.id, req.body.fullName);
        res.json({message: 'Name updated successfully'})
    } catch (err) {
        next(err);
    }
}

/** PATCH /auth/me/password */
async function updatePasswordController(req, res, next) {
    try {
        await changePassword(req.user.id, req.body.currentPassword, req.body.newPassword);
        res.json({message: 'Password updated successfully'});
    } catch (error) {
        next(error);
    }
}

/** GET /auth/verify-email — completes signup verification from an emailed link. */
async function verifyEmailController(req, res, next) {
    try {
        const {token} = req.query;
        const result = await verifyEmail(token);
        res.status(200).json(result)
    } catch(error) {
        next(error);
    }
}

/** POST /auth/resend-verification */
async function resendVerificationController(req, res, next) {
    try {
        const { email } = req.body;
        const result = await resendVerification(email);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
}

/** POST /auth/me/email — starts an email-change request (confirmed via a link to the new address). */
async function requestEmailChangeController(req, res, next) {
    try{
        const {newEmail} = req.body;
        const result = await requestEmailChange(req.user.id, newEmail);
        res.status(200).json(result);
    }catch(error) {
        next(error);
    }
}

/** GET /auth/confirm-email-change — completes an email-change request from the emailed link. */
async function confirmEmailChangeController(req, res, next) {
    try {
        const {token} = req.query;
        const result = await confirmEmailChange(token);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
}

/** POST /auth/forgot-password */
async function forgotPasswordController(req, res, next) {
    try {
        const {email} = req.body;
        const result = await forgotPassword(email);
        res.status(200).json(result)
    } catch (error) {
        next(error)
    }
}

/** POST /auth/reset-password */
async function resetPasswordController(req, res, next) {
    try {
        const {token , newPassword} = req.body;
        const result = await resetPassword(token, newPassword);

        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
}
module.exports = {
    signUpController, loginController, meController, updateNameController, updatePasswordController,
    verifyEmailController, resendVerificationController, requestEmailChangeController, confirmEmailChangeController,
    forgotPasswordController, resetPasswordController
}
