// Prices live in .env (see .env.example) so they can be changed without
// touching code — same reasoning as the bank/contact details in billing.js.
// Falls back to these defaults if a var is unset, so a missing env value
// shows a real number instead of "NaN" rendering straight into the UI.
function envPrice(key, fallback) {
  const value = Number(import.meta.env[key]);
  return Number.isFinite(value) ? value : fallback;
}

export const PLANS = [
  {
    id: "free",
    planId: "Free",
    name: "Free",
    description: "Perfect for new storefronts testing real-time traffic.",
    monthlyPricePKR: 0,
    annualPricePKR: 0,
    popular: false,
    features: [
      "Up to 10,000 monthly events",
      "1 Ecommerce storefront",
      "Real-time visitor telemetry",
      "Product click tracking",
    ],
    buttonText: "Start Free",
    buttonVariant: "outline",
  },
  {
    id: "pro",
    planId: "Pro",
    name: "Pro",
    description: "Built for scaling brands optimizing conversion rates.",
    monthlyPricePKR: envPrice("VITE_PRICE_PRO_MONTHLY_PKR", 8000),
    annualPricePKR: envPrice("VITE_PRICE_PRO_ANNUAL_PKR", 6500),
    popular: true,
    features: [
      "Up to 100,000 monthly events",
      "Up to 5 Ecommerce storefronts",
      "Real-time visitor telemetry",
      "Product click tracking",
      "Priority email support",
    ],
    buttonText: "Get Started",
    buttonVariant: "primary",
  },
  {
    id: "business",
    planId: "Business",
    name: "Business",
    description: "For high-volume stores requiring custom telemetry.",
    monthlyPricePKR: envPrice("VITE_PRICE_BUSINESS_MONTHLY_PKR", 28000),
    annualPricePKR: envPrice("VITE_PRICE_BUSINESS_ANNUAL_PKR", 22000),
    popular: false,
    features: [
      "Unlimited monthly events",
      "Unlimited storefronts",
      "Real-time visitor telemetry",
      "Product click tracking",
      "Dedicated account manager",
      "24/7 Priority support SLA",
    ],
    buttonText: "Contact Sales",
    buttonVariant: "outline",
  },
];

export const FAQS = [
  {
    question: "Does the StorePulse script slow down my storefront?",
    answer: "No. StorePulse uses an ultra-lightweight script (< 5KB).",
  },
  {
    question: "How long does integration take?",
    answer: "Pageview tracking starts the moment you paste one script tag into your site's header — most people are live in a couple of minutes. Product-click tracking takes a little more: add two data attributes to your product card markup so StorePulse knows what was clicked. Full steps are in the docs.",
  },
  {
    question: "Is a credit card required to sign up?",
    answer: "No credit card is required to sign up or start tracking. The Free plan is genuinely free, and you can upgrade to Pro or Business whenever you're ready.",
  },
  {
    question: "Can I track multiple ecommerce stores under one account?",
    answer: "Yes! You can manage multiple storefronts under a single StorePulse dashboard and switch between them seamlessly with dedicated API keys per site.",
  },
  {
    question: "How does StorePulse handle shopper privacy & GDPR compliance?",
    answer: "StorePulse respects visitor privacy out-of-the-box. We do not track personal identifying information (PII) across third-party sites and offer 100% cookieless tracking modes for GDPR compliance.",
  },
];
