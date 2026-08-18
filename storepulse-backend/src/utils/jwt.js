/**
 * Thin wrapper around jsonwebtoken for signing and verifying the app's auth
 * tokens, so JWT_SECRET and JWT_EXPIRES_IN are only read from env in one
 * place.
 */
const jwt = require('jsonwebtoken')

/**
 * Signs a payload into a JWT using the app's shared secret and expiry.
 *
 * @param {object} payload
 * @returns {string} The signed JWT.
 */
function signToken(payload){
    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
}

/**
 * Verifies and decodes a JWT. Throws if the token is invalid or expired.
 *
 * @param {string} token
 * @returns {object} The decoded payload.
 */
function verifyToken(token) {
    return jwt.verify(token, process.env.JWT_SECRET);
}

module.exports = {
    signToken, verifyToken
}
