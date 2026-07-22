const {findUserByEmail, createUser, findUserById, updateUserName, updateUserPassword, 
    setVerificationToken, findUserByVerificationToken, markEmailVerified,
    setPendingEmailToken, findUserByPendingEmailToken, confirmPendingEmail
} = require('./auth.repository')
const {generateToken, hashToken} = require('../../utils/verificationToken');
const {hashPassword, comparePassword} = require('../../utils/passwordHashing')
const {signToken} = require('../../utils/jwt')
const AppError = require('../../utils/AppError');
const { sendVerificationEmail, sendEmailChangeEmail } = require('../email/email.service');

const VERIFICATION_EXPIRY_MS = 24*60*60*1000;
const EMAIL_CHANGE_EXPIRY_MS = 60*60*1000;

async function signUp(fullName, email, password) {
    console.log("SignUP service is runnig")
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
    await sendVerificationEmail({fullName: user.fullName, email: user.email, rawToken});

    return{
        message: 'Account created. Please check your email to verify your account.'
    };
}

async function login(email, password) {
    console.log('Login service is called')
    const user = await findUserByEmail(email);
    if(!user) {
        throw new AppError("User doesn't exist", 401)
    }
    const isPasswordValid = await comparePassword(password, user.password);
    if(!isPasswordValid){
        throw new AppError('Invalid password.', 401);
    }

    if(!user.isEmailVerified) {
        throw new AppError('Please verify your email before logging in.', 403)
    }

    const token = signToken({userId: user.id})
    return {
        user: {id: user.id, fullName: user.fullName, email: user.email},
        token
    }
}

async function getUserById(id) {
    console.log('getuserbyid service is called')
    const user = await findUserById(id);
    if(!user){
        throw new AppError("User not found", 404);
    }

    return {id: user.id, fullName: user.fullName, email: user.email}
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

module.exports= {
    signUp, login, getUserById, changeName, changePassword,
    verifyEmail, resendVerification, requestEmailChange, confirmEmailChange
}