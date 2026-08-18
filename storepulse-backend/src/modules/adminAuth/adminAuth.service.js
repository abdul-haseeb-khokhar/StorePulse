/**
 * Business logic for admin authentication: sending/resending invites,
 * activating an invited admin, and admin login.
 */
const {findAdminByEmail, findAdminById, createAdminInvite, updateAdminInvite, findAdminByInviteToken, activateAdmin, listAdmins} = require('./adminAuth.repository');
const {generateToken, hashToken} = require('../../utils/verificationToken');
const {hashPassword, comparePassword, DUMMY_PASSWORD_HASH} = require('../../utils/passwordHashing');
const {signToken} = require('../../utils/jwt');
const AppError = require('../../utils/AppError');
const {sendAdminInviteEmail} = require('../email/email.service');

const INVITE_EXPIRY_MS = 24 * 60 * 60 * 1000;

/**
 * Sends a new admin invite, or resends one for a still-pending address.
 *
 * @param {string} email
 */
async function inviteAdmin(email) {
    const existingAdmin = await findAdminByEmail(email);
    if(existingAdmin?.isActive) {
        throw new AppError('An admin account with this email already exists', 409);
    }

    const rawToken = generateToken();
    const hashedToken = hashToken(rawToken);
    const expiry = new Date(Date.now() + INVITE_EXPIRY_MS);

    // DB write happens first — this is the durable, authoritative step.
    // Once this succeeds, the invite exists and can always be resent (see
    // the existingAdmin branch below), so a failure past this point is
    // always recoverable by just inviting the same address again.
    if(existingAdmin) {
        // A still-pending invite (never activated) — resending updates its
        // token/expiry in place rather than erroring, since a superadmin
        // legitimately needs to resend a lost or expired invite too.
        await updateAdminInvite(existingAdmin.id, {hashedToken, expiry});
    } else {
        await createAdminInvite({email, hashedToken, expiry});
    }

    try {
        await sendAdminInviteEmail({email, rawToken});
    } catch (error) {
        throw new AppError(
            'Invite was saved, but the email failed to send. Click "Invite admin" for this address again to resend it.',
            502
        );
    }

    return {message: 'Invite sent. The new admin will receive an email to set their password.'};
}

/**
 * Activates a pending admin account from an invite link.
 *
 * @param {string} rawToken
 * @param {string} fullName
 * @param {string} password
 */
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

/**
 * Verifies admin credentials and issues a session JWT.
 *
 * @param {string} email
 * @param {string} password
 */
async function loginAdmin(email, password) {
    const admin = await findAdminByEmail(email);

    // A pending (not-yet-activated) admin has no password set yet, so
    // comparePassword still needs the dummy hash fallback for that case too.
    const isPasswordValid = await comparePassword(password, admin?.password || DUMMY_PASSWORD_HASH);

    if(!admin || !admin.isActive || !isPasswordValid) {
        throw new AppError('Email or password is invalid!', 401);
    }

    const token = signToken({adminId: admin.id, role: admin.role});
    return {
        admin: {id: admin.id, fullName: admin.fullName, email: admin.email, role: admin.role},
        token
    };
}

/** All admin accounts (active and pending), for the superadmin admins list. */
async function listAdminsService() {
    return listAdmins();
}

module.exports = {inviteAdmin, acceptInvite, loginAdmin, listAdminsService}
