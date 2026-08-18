/**
 * Token helpers for email verification / password reset flows: a random
 * token to send to the user, and a hash of it to store in the database so a
 * DB leak doesn't expose usable tokens.
 */
const crypto = require('node:crypto');

/**
 * Generates a random token to email to the user (the raw, unhashed value).
 *
 * @returns {string} A 64-character hex token.
 */
function generateToken () {
    return crypto.randomBytes(32).toString('hex');
}

/**
 * Hashes a raw token for storage/lookup, so the database never holds a
 * usable token in plaintext.
 *
 * @param {string} rawToken
 * @returns {string} The SHA-256 hex digest of the token.
 */
function hashToken(rawToken) {
    return crypto.createHash('sha256').update(rawToken).digest('hex');
}

module.exports = {generateToken, hashToken};
