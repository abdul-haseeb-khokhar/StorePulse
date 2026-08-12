import { CONTACT_WHATSAPP } from "./contact";

// Bank details are real account info, not something to hardcode into the
// bundle — same reasoning as contact.js's env-sourced values.
export const BANK_NAME = import.meta.env.VITE_BANK_NAME;
export const BANK_ACCOUNT_TITLE = import.meta.env.VITE_BANK_ACCOUNT_TITLE;
export const BANK_ACCOUNT_NUMBER = import.meta.env.VITE_BANK_ACCOUNT_NUMBER;
export const BANK_IBAN = import.meta.env.VITE_BANK_IBAN;

const PKR_FORMATTER = new Intl.NumberFormat("en-PK", {
  style: "currency",
  currency: "PKR",
  maximumFractionDigits: 0,
});

export function formatPKR(amount) {
  return PKR_FORMATTER.format(amount);
}

// Yearly billing is one lump-sum transfer up front (there's no recurring
// auto-charge behind a manual bank transfer), so the amount owed is the
// discounted monthly rate × 12 — not the monthly rate itself.
export function totalForCycle(plan, cycle) {
  return cycle === "yearly" ? plan.annualPricePKR * 12 : plan.monthlyPricePKR;
}

// Prefilled WhatsApp message so telling us "I've paid" costs the user one
// tap instead of composing a message from scratch. No backend involved —
// matching intake still happens by hand against the bank statement.
export function buildPaymentNoticeUrl({ planName, cycle, amount, email }) {
  const message =
    `Hi, I've sent a bank transfer for the ${planName} plan (${cycle}), ` +
    `${formatPKR(amount)}. My StorePulse account email is ${email}. ` +
    `Please activate my plan once you've verified the transfer.`;

  return `https://wa.me/${CONTACT_WHATSAPP}?text=${encodeURIComponent(message)}`;
}
