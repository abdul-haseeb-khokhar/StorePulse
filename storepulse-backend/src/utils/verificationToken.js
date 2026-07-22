const crypto = require('node:crypto');

function generateToken () {
    return crypto.randomBytes(32).toString('hex');
}

function hashToken(rawToken) {
    return crypto.createHash('sha256').update(rawToken).digest('hex');
}

module.exports = {generateToken, hashToken};