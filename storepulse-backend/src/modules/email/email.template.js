const BRAND_COLOR = '#2563EB';

function baseLayout({ heading, bodyText, buttonText, buttonUrl, footerNote }) {
    return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f5f7; padding: 40px 20px;">
        <div style="max-width: 480px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">
            <h1 style="margin: 0 0 8px; font-size: 20px; color: #111827;">StorePulse</h1>
            <h2 style="margin: 24px 0 12px; font-size: 18px; color: #111827;">${heading}</h2>
            <p style="margin: 0 0 24px; font-size: 14px; line-height: 1.6; color: #4b5563;">${bodyText}</p>
            <a href="${buttonUrl}" style="display: inline-block; background-color: ${BRAND_COLOR}; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-size: 14px; font-weight: 600;">${buttonText}</a>
            <p style="margin: 24px 0 0; font-size: 12px; line-height: 1.5; color: #9ca3af;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <span style="word-break: break-all;">${buttonUrl}</span>
            </p>
            ${footerNote ? `<p style="margin: 16px 0 0; font-size: 12px; color: #9ca3af;">${footerNote}</p>` : ''}
        </div>
    </div>
    `;
}

function verificationEmailTemplate({fullName, verifyUrl}) {
    const heading = 'Verify your Email';
    const bodyText = `Hi ${fullName}, thanks for signing up for StorePulse. Please confirm your email address to activate your account`;
    const html = baseLayout({
        heading,
        bodyText, 
        buttonText: 'Verify Email',
        buttonUrl: verifyUrl,
        footerNote : 'This link expires in 24 hours. If you didn\'t createa StorePulse account , you can ignore this email'
    });
    const text = `Hi ${fullName},\n\nThanks for sigining up for StorePulse. Please verify your email by visiting this link:\n${verifyUrl}\n\nThis link expires in 24 hours. If you didn\'t createa StorePulse account , you can ignore this email`;

    return {subject: 'Verify your StorePulse account', html, text};
}

function emailChangeTemplate({ fullName, confirmUrl}) {
    const heading = 'Confirm your new email';
    const bodyText = `Hi ${fullName}, we recieved a request to change the email address on your StorePulse account. Confirm this new address to complete the change.`;
    const html = baseLayout({
        heading,
        bodyText,
        buttonText: 'Confirm Email Change',
        buttonUrl: confirmUrl,
        footerNote: 'This link expires in 1 hour. If you didn\'t request this change, you can safely ignore this email — your current email will remain active.'
    });
    const text = `Hi ${fullName},\n\nWe received a request to change the email address on your StorePulse account. Confirm this new address:\n${confirmUrl}\n\nThis link expires in 1 hours. If you didn't request this change, ignore this email.`;

    return {subject: 'Confirm your new StorePulse email', html, text};
}

module.exports = { verificationEmailTemplate, emailChangeTemplate}