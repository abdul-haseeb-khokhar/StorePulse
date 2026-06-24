const crypto = require('crypto');

function generateApiKey(){
    const randomPart = crypto.randomBytes(16).toString("hex")
    return `sp_live_${randomPart}`
}

module.exports = {
    generateApiKey
}