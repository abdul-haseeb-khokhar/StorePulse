// Colors and type mirror storepulse-frontend/src/index.css's light-theme
// tokens (--paper, --paper-card, --ink, --stamp, --divider, --muted) so
// these emails read as the same product as the app. Email clients don't
// support CSS custom properties, so the values are inlined directly, and
// the font stacks fall back the same way index.css's --font-display /
// --font-body do (no web font is loaded — most clients would strip it).

const FONT_DISPLAY = "'IBM Plex Mono', ui-monospace, 'SF Mono', Menlo, monospace";
const FONT_BODY = "'IBM Plex Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif";

const PAPER = '#f4f5f0';
const PAPER_CARD = '#fbfbf8';
const INK = '#1c1b18';
const STAMP = '#2f4b7c';
const DIVIDER = '#dcd9cf';
const MUTED = '#726f66';

function baseLayout({ kicker, heading, bodyText, buttonText, buttonUrl, footerNote }) {
    return `
    <div style="font-family: ${FONT_BODY}; background-color: ${PAPER}; padding: 40px 20px;">
        <div style="max-width: 480px; margin: 0 auto; background-color: ${PAPER_CARD}; border: 1px solid ${DIVIDER}; border-radius: 0; padding: 40px;">
            <div style="font-family: ${FONT_DISPLAY}; font-weight: 700; font-size: 17px; letter-spacing: -0.01em; color: ${INK};">StorePulse</div>
            <div style="margin: 24px 0 8px; font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; color: ${STAMP}; font-weight: 600;">${kicker}</div>
            <h1 style="margin: 0 0 12px; font-family: ${FONT_DISPLAY}; font-weight: 700; font-size: 20px; line-height: 1.2; color: ${INK};">${heading}</h1>
            <p style="margin: 0 0 24px; font-size: 14px; line-height: 1.6; color: ${INK};">${bodyText}</p>
            <a href="${buttonUrl}" style="display: inline-block; background-color: ${STAMP}; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 0; font-family: ${FONT_BODY}; font-size: 14px; font-weight: 600;">${buttonText}</a>
            <p style="margin: 24px 0 0; font-size: 12px; line-height: 1.5; color: ${MUTED};">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <span style="word-break: break-all;">${buttonUrl}</span>
            </p>
            ${footerNote ? `<p style="margin: 16px 0 0; font-size: 12px; color: ${MUTED}; border-top: 1px solid ${DIVIDER}; padding-top: 16px;">${footerNote}</p>` : ''}
        </div>
    </div>
    `;
}

function verificationEmailTemplate({fullName, verifyUrl}) {
    const kicker = 'Get started';
    const heading = 'Verify your email';
    const bodyText = `Hi ${fullName}, thanks for signing up for StorePulse. Please confirm your email address to activate your account`;
    const html = baseLayout({
        kicker,
        heading,
        bodyText,
        buttonText: 'Verify email',
        buttonUrl: verifyUrl,
        footerNote : 'This link expires in 24 hours. If you didn\'t createa StorePulse account , you can ignore this email'
    });
    const text = `Hi ${fullName},\n\nThanks for sigining up for StorePulse. Please verify your email by visiting this link:\n${verifyUrl}\n\nThis link expires in 24 hours. If you didn\'t createa StorePulse account , you can ignore this email`;

    return {subject: 'Verify your StorePulse account', html, text};
}

function emailChangeTemplate({ fullName, confirmUrl}) {
    const kicker = 'Account';
    const heading = 'Confirm your new email';
    const bodyText = `Hi ${fullName}, we recieved a request to change the email address on your StorePulse account. Confirm this new address to complete the change.`;
    const html = baseLayout({
        kicker,
        heading,
        bodyText,
        buttonText: 'Confirm email change',
        buttonUrl: confirmUrl,
        footerNote: 'This link expires in 1 hour. If you didn\'t request this change, you can safely ignore this email — your current email will remain active.'
    });
    const text = `Hi ${fullName},\n\nWe received a request to change the email address on your StorePulse account. Confirm this new address:\n${confirmUrl}\n\nThis link expires in 1 hours. If you didn't request this change, ignore this email.`;

    return {subject: 'Confirm your new StorePulse email', html, text};
}

module.exports = { verificationEmailTemplate, emailChangeTemplate}
