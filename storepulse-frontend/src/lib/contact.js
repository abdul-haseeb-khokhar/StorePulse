/**
 * Contact touchpoints (email, WhatsApp) used across the app's "need help"
 * links, plus the NYRON credit link used in footers.
 */
export const CONTACT_EMAIL = import.meta.env.VITE_CONTACT_EMAIL;

// Plain mailto: links depend on whatever mail client the OS/browser has
// registered as the default handler, which usually isn't Gmail even
// though most people actually use Gmail. Linking straight to Gmail's own
// compose screen sidesteps that and works for anyone signed into Google.
export const CONTACT_GMAIL_URL = `https://mail.google.com/mail/?view=cm&fs=1&to=${CONTACT_EMAIL}`;

export const CONTACT_WHATSAPP = import.meta.env.VITE_CONTACT_WHATSAPP;
export const CONTACT_WHATSAPP_DISPLAY = import.meta.env.VITE_CONTACT_WHATSAPP_DISPLAY;

// Every generic "need help / contact us" touchpoint in the app routes here
// instead of exposing our own email/WhatsApp directly — a fixed brand URL,
// not per-deployment data, so it's hardcoded rather than env-driven (same
// reasoning as the NYRON credit link in AuthLayout.jsx/SiteFooter.jsx).
// Deliberately NOT used by billing.js's buildPaymentNoticeUrl — that's a
// functional payment-verification flow (prefilled WhatsApp message with
// plan/amount/email) that has to reach StorePulse, not NYRON's general
// business inquiries page.
export const NYRON_CONTACT_URL = "https://nyron-x.vercel.app/#talk-business";
