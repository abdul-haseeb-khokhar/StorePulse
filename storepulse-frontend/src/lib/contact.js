export const CONTACT_EMAIL = import.meta.env.VITE_CONTACT_EMAIL;

// Plain mailto: links depend on whatever mail client the OS/browser has
// registered as the default handler, which usually isn't Gmail even
// though most people actually use Gmail. Linking straight to Gmail's own
// compose screen sidesteps that and works for anyone signed into Google.
export const CONTACT_GMAIL_URL = `https://mail.google.com/mail/?view=cm&fs=1&to=${CONTACT_EMAIL}`;

export const CONTACT_WHATSAPP = import.meta.env.VITE_CONTACT_WHATSAPP;
export const CONTACT_WHATSAPP_DISPLAY = import.meta.env.VITE_CONTACT_WHATSAPP_DISPLAY;
export const CONTACT_PHONE = import.meta.env.VITE_CONTACT_PHONE;
export const CONTACT_PHONE_DISPLAY = import.meta.env.VITE_CONTACT_PHONE_DISPLAY;
