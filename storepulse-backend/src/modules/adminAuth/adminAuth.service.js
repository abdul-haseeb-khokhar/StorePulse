const {findAdminByEmail, findAdminById, createAdminInvite, findAdminByInviteToken, activateAdmin, listAdmins} = require('./adminAuth.repository');
const {generateToken, hashToken} = require('../../utils/verificationToken');
const {hashPassword, comparePassword} = require('../../utils/passwordHashing');
const {signToken} = require('../../utils/jwt');
const AppError = require('../../utils/AppError');
const {sendAdminInviteEmail} = require('../email/email.service');

const INVITE_EXPIRY_MS = 24 * 60 * 60 * 1000;

async function inviteAdmin(email) {
    const existingAdmin = await findAdminByEmail(email);
    if(existingAdmin) {
        throw new AppError('An admin account with this email already exists', 409);
    }

    const rawToken = generateToken();
    const hashedToken = hashToken(rawToken);
    const expiry = new Date(Date.now() + INVITE_EXPIRY_MS);

    await createAdminInvite({email, hashedToken, expiry});
    await sendAdminInviteEmail({email, rawToken});

    return {message: 'Invite sent. The new admin will receive an email to set their password.'};
}

async function acceptInvite(rawToken, fullName, password) {
    const hashedToken = hashToken(rawToken);
    const admin = await findAdminByInviteToken(hashedToken);

    if(!admin) {
        throw new AppError('Invalid or expired invite link', 400);
    }
    if(admin.isActive) {
        throw new AppError('This invite has already been used', 400);
    }
    if(admin.inviteTokenExpiry < new Date()) {
        throw new AppError('Invite link has expired. Ask a superadmin to send a new one.', 400);
    }

    const hashedPassword = await hashPassword(password);
    await activateAdmin(admin.id, {fullName, hashedPassword});

    return {message: 'Admin account activated. You can now log in.'};
}

async function loginAdmin(email, password) {
    const admin = await findAdminByEmail(email);

    const isPasswordValid = admin && admin.isActive && await comparePassword(password, admin.password);

    if(!admin || !isPasswordValid) {
        throw new AppError('Email or password is invalid!', 401);
    }

    const token = signToken({adminId: admin.id, role: admin.role});
    return {
        admin: {id: admin.id, fullName: admin.fullName, email: admin.email, role: admin.role},
        token
    };
}

async function listAdminsService() {
    return listAdmins();
}

module.exports = {inviteAdmin, acceptInvite, loginAdmin, listAdminsService}
