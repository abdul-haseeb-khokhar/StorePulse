/**
 * HTML/plain-text builders for every transactional email the app sends.
 * Colors and type mirror storepulse-frontend/src/index.css's light-theme
 * tokens (--paper, --paper-card, --ink, --stamp, --divider, --muted) so
 * these emails read as the same product as the app. Email clients don't
 * support CSS custom properties, so the values are inlined directly, and
 * the font stacks fall back the same way index.css's --font-display /
 * --font-body do (no web font is loaded — most clients would strip it).
 */

const FONT_DISPLAY = "'IBM Plex Mono', ui-monospace, 'SF Mono', Menlo, monospace";
const FONT_BODY = "'IBM Plex Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif";

const PAPER = '#f4f5f0';
const PAPER_CARD = '#fbfbf8';
const INK = '#1c1b18';
const STAMP = '#2f4b7c';
const DIVIDER = '#dcd9cf';
const MUTED = '#726f66';

// fullName is user-controlled (2-50 chars, no character-class restriction —
// see registerSchema in auth.validator.js) and lands straight in bodyText
// below, which baseLayout embeds into the HTML email unescaped otherwise.
// Only used for the html variant; the plain-text version doesn't need it.
const HTML_ESCAPES = {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'};
function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (char) => HTML_ESCAPES[char]);
}

/** Shared card layout every template renders its content into. */
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
    const bodyText = `Hi ${escapeHtml(fullName)}, thanks for signing up for StorePulse. Please confirm your email address to activate your account`;
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
    const bodyText = `Hi ${escapeHtml(fullName)}, we recieved a request to change the email address on your StorePulse account. Confirm this new address to complete the change.`;
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

function passwordResetTemplate({fullName, resetUrl}) {
    const kicker = 'Account';
    const heading = 'Reset your password';
    const bodyText = `Hi ${escapeHtml(fullName)}, we received a request to reset the password on your StorePulse account. Choose a new password to continue.`;
    const html = baseLayout({
        kicker,
        heading,
        bodyText,
        buttonText: 'Reset password',
        buttonUrl: resetUrl,
        footerNote: 'This link expires in 1 hour. If you didn\'t request this, you can safely ignore this email — your password will remain unchanged.'
    });
    const text = `Hi ${fullName},\n\nWe received a request to reset the password on your StorePulse account. Reset it here:\n${resetUrl}\n\nThis link expires in 1 hour. If you didn't request this, ignore this email.`;

    return {subject: 'Reset your StorePulse password', html, text};
}

function adminInviteTemplate({acceptUrl}) {
    const kicker = 'Admin access';
    const heading = 'You\'ve been invited as a StorePulse admin';
    const bodyText = 'An existing admin has invited you to manage StorePulse. Set your password to activate your admin account.';
    const html = baseLayout({
        kicker,
        heading,
        bodyText,
        buttonText: 'Set your password',
        buttonUrl: acceptUrl,
        footerNote: 'This link expires in 24 hours. If you weren\'t expecting this invite, you can ignore this email.'
    });
    const text = `You've been invited to manage StorePulse as an admin.\n\nSet your password to activate your account:\n${acceptUrl}\n\nThis link expires in 24 hours. If you weren't expecting this invite, ignore this email.`;

    return {subject: 'You\'ve been invited to StorePulse admin', html, text};
}

/**
 * The lightweight half of gap #12 from the subscription scoping pass —
 * there's no in-app notification center yet, so this reuses the email
 * infrastructure that already works rather than building a throwaway
 * stand-in for whatever that center ends up looking like.
 */
function planChangedTemplate({fullName, plan, billingCycle, currentPeriodEnd, billingUrl}) {
    const kicker = 'Account';
    const heading = 'Your plan has changed';
    const cycleNote = billingCycle ? ` (billed ${billingCycle})` : '';
    const periodNote = currentPeriodEnd
        ? ` Your current period runs through ${new Date(currentPeriodEnd).toLocaleDateString()}.`
        : '';
    const bodyText = `Hi ${escapeHtml(fullName)}, your StorePulse plan is now <strong>${plan}</strong>${cycleNote}.${periodNote}`;
    const html = baseLayout({
        kicker,
        heading,
        bodyText,
        buttonText: 'View billing',
        buttonUrl: billingUrl,
        footerNote: "If this wasn't expected, reach out and we'll help sort it out.",
    });
    const text = `Hi ${fullName},\n\nYour StorePulse plan is now ${plan}${cycleNote}.${periodNote}\n\nView your billing: ${billingUrl}`;

    return {subject: `Your StorePulse plan is now ${plan}`, html, text};
}

const ACCOUNT_STATUS_COPY = {
    Active: 'Your account is active again — you can log in and pick up where you left off.',
    Banned: "Your account has been suspended by an administrator. If you believe this is a mistake, reach out to support.",
    Deleted: "Your account has been deleted. If you didn't request this, contact support right away.",
};

function accountStatusChangedTemplate({fullName, status, settingsUrl}) {
    const kicker = 'Account';
    const heading = `Your account is now ${status}`;
    const statusNote = ACCOUNT_STATUS_COPY[status] || `Your account status changed to ${status}.`;
    const bodyText = `Hi ${escapeHtml(fullName)}, ${statusNote}`;
    const html = baseLayout({
        kicker,
        heading,
        bodyText,
        buttonText: 'Go to StorePulse',
        buttonUrl: settingsUrl,
        footerNote: 'Questions about this change? Just reply to this email.',
    });
    const text = `Hi ${fullName},\n\n${statusNote}\n\n${settingsUrl}`;

    return {subject: `Your StorePulse account is now ${status}`, html, text};
}

function paymentRequestReviewedTemplate({fullName, status, plan, reviewNote, billingUrl}) {
    const kicker = 'Billing';
    const isApproved = status === 'Approved';
    const heading = isApproved ? 'Your payment was verified' : 'Your payment request needs another look';
    const outcomeNote = isApproved
        ? `Your ${plan} plan is now active.`
        : "We couldn't verify this payment yet.";
    const noteLine = reviewNote ? ` ${escapeHtml(reviewNote)}` : '';
    const bodyText = `Hi ${escapeHtml(fullName)}, ${outcomeNote}${noteLine}`;
    const html = baseLayout({
        kicker,
        heading,
        bodyText,
        buttonText: 'View billing',
        buttonUrl: billingUrl,
        footerNote: isApproved
            ? 'Thanks for your business!'
            : "You're welcome to submit a new payment request once you've sorted this out.",
    });
    const rawNoteLine = reviewNote ? ` ${reviewNote}` : '';
    const text = `Hi ${fullName},\n\n${outcomeNote}${rawNoteLine}\n\nView your billing: ${billingUrl}`;

    return {
        subject: isApproved ? `Your StorePulse ${plan} plan is active` : 'Your StorePulse payment request was rejected',
        html,
        text,
    };
}

/**
 * Row 6 of the notification scoping pass — syncExpiredSubscription
 * (subscription.service.js) applies this downgrade lazily, on whatever
 * request happens to notice the period has ended, with nothing telling the
 * user it happened. `wasScheduled` distinguishes the two reasons it can
 * fire (see recordSubscriptionHistory's reason strings there): a plan that
 * simply lapsed vs. a self-service cancel finally landing — the user asked
 * for the second one, so the copy confirms it rather than breaking it as news.
 */
function subscriptionExpiredTemplate({fullName, previousPlan, wasScheduled, billingUrl}) {
    const kicker = 'Account';
    const heading = 'Your plan is now Free';
    const bodyText = wasScheduled
        ? `Hi ${escapeHtml(fullName)}, as scheduled, your cancellation has taken effect and your account has moved from <strong>${previousPlan}</strong> to the Free plan.`
        : `Hi ${escapeHtml(fullName)}, your <strong>${previousPlan}</strong> plan's billing period ended without a renewal, so your account has moved to the Free plan.`;
    const html = baseLayout({
        kicker,
        heading,
        bodyText,
        buttonText: 'View billing',
        buttonUrl: billingUrl,
        footerNote: `Want to get back on ${previousPlan}? You can submit a new payment request anytime from the billing page.`,
    });
    const text = `Hi ${fullName},\n\n${wasScheduled
        ? `As scheduled, your cancellation has taken effect and your account has moved from ${previousPlan} to the Free plan.`
        : `Your ${previousPlan} plan's billing period ended without a renewal, so your account has moved to the Free plan.`
    }\n\nView your billing: ${billingUrl}`;

    return {subject: 'Your StorePulse plan is now Free', html, text};
}

/**
 * Row 7 of the notification scoping pass — a plan change (admin-set or a
 * lazy expiry) can lower maxSites below what a user's already-created
 * sites need, silently pushing the newest ones out of the active ranking
 * (see sites.service.js's annotateActiveSites/getNewlyDeactivatedSites).
 * Those sites keep accepting events from their embedded snippet either
 * way — ingest doesn't reject them — they just stop counting, which is a
 * confusing thing to notice only by an analytics dashboard looking wrong.
 */
function sitesDeactivatedTemplate({fullName, sites, plan, billingUrl}) {
    const kicker = 'Sites';
    const heading = sites.length === 1 ? 'One of your sites is now inactive' : `${sites.length} of your sites are now inactive`;
    const siteList = sites.map((site) => `${escapeHtml(site.name)} (${escapeHtml(site.domain)})`).join(', ');
    const bodyText = `Hi ${escapeHtml(fullName)}, your ${escapeHtml(plan)} plan's site limit no longer covers: <strong>${siteList}</strong>. They'll keep receiving events, but won't appear in your dashboard until you upgrade or free up a slot.`;
    const html = baseLayout({
        kicker,
        heading,
        bodyText,
        buttonText: 'View sites',
        buttonUrl: billingUrl,
        footerNote: 'Upgrading your plan reactivates them immediately — no data is lost while a site is inactive.',
    });
    const rawSiteList = sites.map((site) => `${site.name} (${site.domain})`).join(', ');
    const text = `Hi ${fullName},\n\nYour ${plan} plan no longer covers: ${rawSiteList}.\n\nThey'll keep receiving events, but won't appear in your dashboard until you upgrade or free up a slot.\n\n${billingUrl}`;

    return {
        subject: sites.length === 1 ? 'One of your StorePulse sites is now inactive' : `${sites.length} of your StorePulse sites are now inactive`,
        html,
        text,
    };
}

module.exports = {
    verificationEmailTemplate, emailChangeTemplate, passwordResetTemplate, adminInviteTemplate,
    planChangedTemplate, accountStatusChangedTemplate, paymentRequestReviewedTemplate,
    subscriptionExpiredTemplate, sitesDeactivatedTemplate,
}
