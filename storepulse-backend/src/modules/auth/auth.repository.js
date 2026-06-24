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

async function  createUser(fullName, email, hashedPassword) {
    return prisma.user.create({
        data: {
            fullName,
            email,
            password: hashedPassword,
        }
    });
}

module.exports = {
    findUserByEmail, createUser, findUserById
} 