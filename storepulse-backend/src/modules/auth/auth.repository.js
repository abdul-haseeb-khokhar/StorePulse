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
    return prisma.user.update({ where: {id: userId, data: {fullName}}})
}

async function updateUserPassword(userId, hashedPassword) {
    return prisma.user.update({where: {id: userId}, data: {password: hashedPassword}});
}

module.exports = {
    findUserByEmail, createUser, findUserById, updateUserName, updateUserPassword
} 