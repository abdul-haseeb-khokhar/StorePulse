/**
 * Generates the API keys sites use to authenticate ingest requests.
 */
const crypto = require('crypto');

/**
 * Builds a new site API key.
 * The `sp_live_` prefix makes keys self-identifying in logs and lets future
 * key types (e.g. test keys) use a different prefix without ambiguity.
 *
 * @returns {string} A new API key, e.g. "sp_live_<32 hex chars>".
 */
function generateApiKey(){
    const randomPart = crypto.randomBytes(16).toString("hex")
    return `sp_live_${randomPart}`
}

module.exports = {
    generateApiKey
}
