const {findUserByEmail, createUser, findUserById, findUserByIdWithSubscription, updateUserName, updateUserPassword,
    setVerificationToken, findUserByVerificationToken, markEmailVerified,
    setPendingEmailToken, findUserByPendingEmailToken, confirmPendingEmail,
    setPasswordResetToken, findUserByPasswordResetToken, resetUserPassword
} = require('./auth.repository')
const {generateToken, hashToken} = require('../../utils/verificationToken');
const {hashPassword, comparePassword, DUMMY_PASSWORD_HASH} = require('../../utils/passwordHashing')
const {signToken} = require('../../utils/jwt')
const AppError = require('../../utils/AppError');
const { sendVerificationEmail, sendEmailChangeEmail, sendPasswordResetEmail } = require('../email/email.service');
const { updateUserStatus } = require('../admin/admin.repository');
const { syncExpiredSubscription } = require('../subscription/subscription.service');

const VERIFICATION_EXPIRY_MS = 24*60*60*1000;
const EMAIL_CHANGE_EXPIRY_MS = 60*60*1000;
const PASSWORD_RESET_EXPIRY_MS = 60*60*1000;

async function signUp(fullName, email, password) {
    const existingUser = await findUserByEmail(email)
    if(existingUser){
        throw new AppError('An account with this email already exists', 409)
    }

    const hashedPassword = await hashPassword(password);
    const user = await createUser(fullName, email, hashedPassword)

    const rawToken = generateToken();
    const hashedToken = hashToken(rawToken);
    const expiry = new Date(Date.now() + VERIFICATION_EXPIRY_MS);

    await setVerificationToken(user.id, hashedToken, expiry);
    // Best-effort: the account row is already committed by this point, so a
    // Resend outage/bad address shouldn't turn a successful signup into a
    // 500 the client has no way to recover from. The user can still get a
    // fresh link via POST /auth/resend-verification either way.
    try {
        await sendVerificationEmail({fullName: user.fullName, email: user.email, rawToken});
    } catch (error) {
        console.error('Failed to send verification email:', error.message);
    }

    return{
        message: 'Account created. Please check your email to verify your account.'
    };
}

async function login(email, password) {
    const user = await findUserByEmail(email);

    const isPasswordValid = await comparePassword(password, user?.password || DUMMY_PASSWORD_HASH);

    if(!user || !isPasswordValid) {
        throw new AppError("Email or password is invalid!", 401)
    }
    
    if(user.status === 'Banned'){
        throw new AppError('This user is banned by admin', 403, 'ACCOUNT_BANNED');
    }

    if(!user.isEmailVerified && user.status === 'Inactive') {
        throw new AppError('Please verify your email before logging in.', 403)
    }


    const token = signToken({userId: user.id})
    return {
        user: {id: user.id, fullName: user.fullName, email: user.email},
        token
    }
}

async function getUserById(id) {
    const user = await findUserByIdWithSubscription(id);
    if(!user){
        throw new AppError("User not found", 404);
    }

    const subscription = await syncExpiredSubscription(id, user.subscription);
    return {id: user.id, fullName: user.fullName, email: user.email, subscription}
}

async function changeName(userId, fullName) {
    return updateUserName(userId, fullName);
}

async function changePassword(userId, currentPassword, newPassword) {
    const user = await findUserById(userId);

    const isMatch = await comparePassword(currentPassword, user.password);

    if(!isMatch) {
        throw new AppError('Current password is incorrect', 401);
    }

    const hashed = await hashPassword(newPassword);

    return updateUserPassword(userId, hashed);
}

async function verifyEmail(rawToken) {
    const hashedToken = hashToken(rawToken);
    const user = await findUserByVerificationToken(hashedToken);

    if(!user) {
        throw new AppError('Invalid or expired verification link', 400);
    }
    if(user.emailVerificationExpiry < new Date()) {
        throw new AppError('Verification link has expired. Please request a new one',400);
    }

    await markEmailVerified(user.id);
    if(user.status === 'Inactive') {
        await updateUserStatus(user.id, {status: 'Active'});
    }
    return {
        message: 'Email verified successfully. You can now log in.'
    };
}

async function resendVerification(email) {
    const user = await findUserByEmail(email);

    if(!user || user.isEmailVerified) {
        return {message: 'If an account with that email exists and is unverified, a new link has been sent.'};
    }

    const rawToken = generateToken();
    const hashedToken = hashToken(rawToken);
    const expiry = new Date(Date.now() + VERIFICATION_EXPIRY_MS);

    await setVerificationToken(user.id, hashedToken, expiry);
    await sendVerificationEmail({fullName: user.fullName, email: user.email, rawToken});

    return { message: 'If an account with that email exists and is unverified, a new link has been sent.' };
}

async function requestEmailChange(userId, newEmail) {
    const user = await findUserById(userId);

    if(newEmail === user.email) {
        throw new AppError('New Email must be different from your current email', 400)
    }
    
    const existingUser = await findUserByEmail(newEmail);
    if(existingUser) {
        throw new AppError('An account with this email already exists', 409);
    }

    const rawToken = generateToken();
    const hashedToken = hashToken(rawToken);
    const expiry = new Date(Date.now() + EMAIL_CHANGE_EXPIRY_MS);

    await setPendingEmailToken(userId, newEmail, hashedToken, expiry);
    await sendEmailChangeEmail({fullName: user.fullName, newEmail, rawToken});

    return { message: 'Please check your new email address to confirm the change.' };
}

async function confirmEmailChange(rawToken) {
    const hashedToken = hashToken(rawToken);
    const user = await findUserByPendingEmailToken(hashedToken);

    if(!user) {
        throw new AppError('Invalid or expired confirmation link', 400)
    }
    if(user.pendingEmailTokenExpiry < new Date()) {
        throw new AppError('Confirmation link hase expired. Please request the change again', 400);
    }

    await confirmPendingEmail(user.id, user.pendingEmail);
    return {message: 'Email address updated successfully'};
}

async function forgotPassword(email) {
    const user = await findUserByEmail(email);

    if(!user) {
        return { message: 'If an account with that email exists, a reset link has been sent.'};
    }

    const rawToken = generateToken();
    const hashedToken = hashToken(rawToken);
    const expiry = new Date (Date.now() + PASSWORD_RESET_EXPIRY_MS);

    await setPasswordResetToken(user.id, hashedToken, expiry);
    await sendPasswordResetEmail({fullName: user.fullName, email: user.email, rawToken});

    return { message: 'If an account with that email exists, a reset link has been sent.'}
}

async function resetPassword(rawToken, newPassword) {
    const hashedToken = hashToken(rawToken);
    const user = await findUserByPasswordResetToken(hashedToken);

    if(!user) {
        throw new AppError('Invalid or expired reset link', 400);
    }

    if(user.passwordResetTokenExpiry < new Date()) {
        throw new AppError('Reset link has expired. Please request a new one', 400);
    }

    const hashed = await hashPassword(newPassword);
    await resetUserPassword(user.id, hashed);

    return {message: 'Password reset successfully. You can now log in.'}
}

module.exports= {
    signUp, login, getUserById, changeName, changePassword, forgotPassword, resetPassword,
    verifyEmail, resendVerification, requestEmailChange, confirmEmailChange
}