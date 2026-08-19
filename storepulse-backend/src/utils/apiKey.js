/**
 * Generates the random tokens sites use to authenticate two very different
 * kinds of request: apiKey for ingest (a storefront's tracker script),
 * publicToken for the read-only public dashboard link. Same entropy, but
 * never interchangeable — see Site.publicToken in schema.prisma for why
 * they're kept as separate, independently revocable fields. Both are just
 * this same random-hex-with-a-prefix shape, so there's one generator
 * underneath and two named, prefix-bound wrappers over it — a leaked
 * value's purpose stays obvious in logs from its prefix, and the two
 * types can never be confused with one another at a glance, without the
 * generation logic itself being duplicated.
 */
const crypto = require('crypto');

/**
 * @param {string} prefix e.g. "sp_live_" or "sp_pub_".
 * @returns {string} `${prefix}<32 hex chars>`.
 */
function generateToken(prefix) {
    const randomPart = crypto.randomBytes(16).toString("hex")
    return `${prefix}${randomPart}`
}

/**
 * Builds a new site API key.
 * The `sp_live_` prefix makes keys self-identifying in logs and lets future
 * key types (e.g. test keys) use a different prefix without ambiguity.
 *
 * @returns {string} A new API key, e.g. "sp_live_<32 hex chars>".
 */
function generateApiKey(){
    return generateToken('sp_live_')
}

/**
 * Builds a new public dashboard share token — same shape as generateApiKey,
 * just its own `sp_pub_` prefix.
 *
 * @returns {string} A new public token, e.g. "sp_pub_<32 hex chars>".
 */
function generatePublicToken(){
    return generateToken('sp_pub_')
}

module.exports = {
    generateApiKey, generatePublicToken
}
