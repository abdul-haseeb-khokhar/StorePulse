const {sendEmail} = require('./email.provider');
const {
    verificationEmailTemplate, emailChangeTemplate, passwordResetTemplate, adminInviteTemplate,
    planChangedTemplate, accountStatusChangedTemplate, paymentRequestReviewedTemplate,
} = require('./email.template');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

async function sendVerificationEmail({fullName, email, rawToken}) {
    const verifyUrl = `${FRONTEND_URL}/verify-email?token=${rawToken}`;

    const {subject, html, text} = verificationEmailTemplate({fullName, verifyUrl});

    return sendEmail({to : email, subject, html, text});
}

async function sendEmailChangeEmail({fullName, newEmail, rawToken}) {
    const confirmUrl = `${FRONTEND_URL}/confirm-email-change?token=${rawToken}`;

    const {subject, html, text} = emailChangeTemplate({fullName, confirmUrl});

    return sendEmail({to: newEmail,subject ,html, text });
}

async function sendPasswordResetEmail({fullName, email, rawToken}) {
    const resetUrl = `${FRONTEND_URL}/reset-password?token=${rawToken}`;

    const {subject, html, text} = passwordResetTemplate({fullName, resetUrl});

    return sendEmail({to: email, subject, html, text});
}

async function sendAdminInviteEmail({email, rawToken}) {
    const acceptUrl = `${FRONTEND_URL}/admin/accept-invite?token=${rawToken}`;

    const {subject, html, text} = adminInviteTemplate({acceptUrl});

    return sendEmail({to: email, subject, html, text});
}

async function sendPlanChangedEmail({fullName, email, plan, billingCycle, currentPeriodEnd}) {
    const billingUrl = `${FRONTEND_URL}/billing`;
    const {subject, html, text} = planChangedTemplate({fullName, plan, billingCycle, currentPeriodEnd, billingUrl});

    return sendEmail({to: email, subject, html, text});
}

async function sendAccountStatusChangedEmail({fullName, email, status}) {
    const settingsUrl = `${FRONTEND_URL}/settings`;
    const {subject, html, text} = accountStatusChangedTemplate({fullName, status, settingsUrl});

    return sendEmail({to: email, subject, html, text});
}

async function sendPaymentRequestReviewedEmail({fullName, email, status, plan, reviewNote}) {
    const billingUrl = `${FRONTEND_URL}/billing`;
    const {subject, html, text} = paymentRequestReviewedTemplate({fullName, status, plan, reviewNote, billingUrl});

    return sendEmail({to: email, subject, html, text});
}

module.exports = {
    sendVerificationEmail, sendEmailChangeEmail, sendPasswordResetEmail, sendAdminInviteEmail,
    sendPlanChangedEmail, sendAccountStatusChangedEmail, sendPaymentRequestReviewedEmail,
};