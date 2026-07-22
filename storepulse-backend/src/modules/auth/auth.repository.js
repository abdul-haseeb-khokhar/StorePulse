const prisma = require('../../config/prisma')

async function findUserByEmail(email) {
    console.log('Find user by email. is called')
    return prisma.user.findUnique({
        where: {email}
    });
}
async function findUserById(id) {
    console.log("finduser by id is called")
    return prisma.user.findUnique({
        where: {id}
    })
}

async function  createUser(fullName, email, hashedPassword) {
    console.log('Create User is called')
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
    console.log('Set verification token is called');
    return prisma.user.update({
        where: {id: userId},
        data: {
            emailVerificationToken: hashedToken,
            emailVerificationExpiry: expiry,
        }
    });
}

async function findUserByVerificationToken(hashedToken) {
    console.log('Find user by verification token is called');
    return prisma.user.findFirst({
        where: {emailVerificationToken: hashedToken}
    });
}

async function markEmailVerified(userId) {
    console.log('Mark email verified is called');
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
    console.log('Set pending email token is called');
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
    console.log('Find user by pending email token is called');
    return prisma.user.findFirst({
        where: {pendingEmailToken: hashedToken}
    });
}

async function confirmPendingEmail(userId, newEmail) {
    console.log('Confirm pending email is called');
    return prisma.user.update({
        where:{id: userId},
        data: {
            pendingEmail: null,
            pendingEmailToken: null,
            pendingEmailTokenExpiry: null,
        }
    })
}
module.exports = {
    findUserByEmail, createUser, findUserById, updateUserName, updateUserPassword,
    setVerificationToken, findUserByVerificationToken, markEmailVerified,
    setPendingEmailToken, findUserByPendingEmailToken, confirmPendingEmail
} 