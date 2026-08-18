/**
 * Prisma queries backing regular user auth: account lookup/creation and the
 * three token-based flows (email verification, email change, password
 * reset).
 */
const prisma = require('../../config/prisma')

async function findUserByEmail(email) {
    return prisma.user.findUnique({
        where: {email}
    });
}
async function findUserById(id) {
    return prisma.user.findUnique({
        where: {id}
    })
}

// Separate from findUserById on purpose — that one runs on every
// authenticated request via the protect middleware, so it stays a plain
// lookup. This join is only needed for the /me response.
async function findUserByIdWithSubscription(id) {
    return prisma.user.findUnique({
        where: {id},
        select: {
            id: true, fullName: true, email: true,
            subscription: {
                select: {plan: true, status: true, currentPeriodEnd: true, pendingPlan: true, billingCycle: true},
            },
        },
    })
}

async function  createUser(fullName, email, hashedPassword) {
    return prisma.user.create({
        data: {
            fullName,
            email,
            password: hashedPassword,
        }
    });
}

async function updateUserName(userId, fullName) {
    return prisma.user.update({ where: {id: userId}, data: {fullName}})
}

async function updateUserPassword(userId, hashedPassword) {
    return prisma.user.update({where: {id: userId}, data: {password: hashedPassword}});
}

async function setVerificationToken(userId, hashedToken, expiry) {
    return prisma.user.update({
        where: {id: userId},
        data: {
            emailVerificationToken: hashedToken,
            emailVerificationExpiry: expiry,
        }
    });
}

async function findUserByVerificationToken(hashedToken) {
    return prisma.user.findFirst({
        where: {emailVerificationToken: hashedToken}
    });
}

async function markEmailVerified(userId) {
    return prisma.user.update({
        where: {id: userId},
        data: {
            isEmailVerified: true,
            emailVerificationToken: null,
            emailVerificationExpiry: null,
        }
    });
}

async function setPendingEmailToken(userId, pendingEmail, hashedToken, expiry) {
    return prisma.user.update({
        where: {id: userId},
        data: {
            pendingEmail,
            pendingEmailToken: hashedToken,
            pendingEmailTokenExpiry: expiry,
        }
    });
}

async function findUserByPendingEmailToken(hashedToken) {
    return prisma.user.findFirst({
        where: {pendingEmailToken: hashedToken}
    });
}

async function confirmPendingEmail(userId, newEmail) {
    return prisma.user.update({
        where:{id: userId},
        data: {
            email: newEmail,
            pendingEmail: null,
            pendingEmailToken: null,
            pendingEmailTokenExpiry: null,
        }
    })
}

async function setPasswordResetToken(userId, hashedToken, expiry) {
    return prisma.user.update({
        where: {id: userId},
        data: {
            passwordResetToken: hashedToken,
            passwordResetTokenExpiry: expiry,
        }
    });
}

async function findUserByPasswordResetToken(hashedToken) {
    return prisma.user.findFirst({
        where: {passwordResetToken: hashedToken}
    });
}

async function resetUserPassword(userId, hashedPassword) {
    return prisma.user.update({
        where: {id: userId},
        data: {
            password: hashedPassword,
            passwordResetToken: null,
            passwordResetTokenExpiry: null,
        }
    });
}
module.exports = {
    findUserByEmail, createUser, findUserById, findUserByIdWithSubscription, updateUserName, updateUserPassword,
    setVerificationToken, findUserByVerificationToken, markEmailVerified,
    setPendingEmailToken, findUserByPendingEmailToken, confirmPendingEmail,
    setPasswordResetToken, findUserByPasswordResetToken, resetUserPassword
}
