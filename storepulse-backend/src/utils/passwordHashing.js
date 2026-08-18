/**
 * bcrypt wrappers for hashing and checking passwords, plus a dummy hash used
 * to keep login timing constant regardless of whether the account exists.
 */
const bcrypt = require('bcrypt')
const SALT_ROUND = 10;

// A bcrypt hash of an arbitrary, never-used string, generated once at the
// same cost factor as real password hashes. Login flows compare against this
// when no matching account exists, so bcrypt's cost is paid either way and
// "no such account" can't be told apart from "wrong password" by timing.
const DUMMY_PASSWORD_HASH = '$2b$10$FmhwwbSMf4Co8IEW2AcfGeX2zMnmxgqP6zcWs1E.VZjbatTpERTAK';

/**
 * Hashes a plaintext password for storage.
 *
 * @param {string} plainPassword
 * @returns {Promise<string>} The bcrypt hash.
 */
async function hashPassword(plainPassword) {
    return bcrypt.hash(plainPassword, SALT_ROUND)
}

/**
 * Checks a plaintext password against a stored hash.
 *
 * @param {string} plainPassword
 * @param {string} hashedPassword
 * @returns {Promise<boolean>}
 */
async function comparePassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword)
}

module.exports = {
    hashPassword, comparePassword, DUMMY_PASSWORD_HASH
}
