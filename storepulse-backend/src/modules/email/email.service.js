const {sendEmail} = require('./email.provider');
const {verificationEmailTemplate, emailChangeTemplate} = require('./email.template');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

async function sendVerificationEmail({fullName, email, rawToken}) {
    const verifyUrl = `${FRONTEND_URL}/verify-email?token=${rawToken}`;

    const {subject, html, text} = verificationEmailTemplate({fullName, verifyUrl});

    return sendEmail({to : email, subject, html, text});
}

async function sendEmailChangeEmail({fullName, newEmail, rawToken}) {
    const confirmUrl = `${FRONTEND_URL}/confirm-email-change?token=${rawToken}`;

    const {subject, html, text} = emailChangeTemplate({fullName, confirmUrl});

    return sendEmail({to: newEmail, html, text });
}

module.exports = {sendVerificationEmail, sendEmailChangeEmail};