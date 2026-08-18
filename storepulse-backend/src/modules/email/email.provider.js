/**
 * Thin wrapper around Resend, the actual email-sending transport. Every
 * outbound email in the app funnels through this one function.
 */
const { Resend } = require('resend');
const AppError = require('../../utils/AppError');

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_ADDRESS = process.env.EMAIL_FROM_ADDRESS || 'StorePulse <onboarding@resend.dev>';

/**
 * Sends one email via Resend.
 *
 * @param {{to: string, subject: string, html: string, text: string}} args
 * @throws {AppError} 502 if Resend reports a send failure.
 */
async function sendEmail({to, subject, html, text}) {
    const {data, error} = await resend.emails.send({
        from: FROM_ADDRESS,
        to,
        subject,
        html,
        text
    });

    if(error) {
        console.error('Resend send error', error);
        throw new AppError('Failed to send email', 502)
    }

    return data;
}

module.exports = {sendEmail};
