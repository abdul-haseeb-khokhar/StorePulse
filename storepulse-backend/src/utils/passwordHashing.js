const bcrypt = require('bcrypt')
const SALT_ROUND = 10;

async function hashPassword(plainPassword) {
    return bcrypt.hash(plainPassword, SALT_ROUND)
}

async function comparePassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword)
}

module.exports = {
    hashPassword, comparePassword
}