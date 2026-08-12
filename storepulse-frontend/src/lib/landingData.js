export const PLANS = [
  {
    id: "starter",
    name: "Starter",
    description: "Perfect for new storefronts testing real-time traffic.",
    monthlyPrice: 0,
    annualPrice: 0,
    popular: false,
    features: [
      "Up to 2,500 monthly page views",
      "1 Ecommerce storefront",
      "Real-time visitor telemetry",
      "7-day data retention",
      "Basic product click tracking",
    ],
    buttonText: "Start Free",
    buttonVariant: "outline",
  },
  {
    id: "pro",
    name: "Pro Growth",
    description: "Built for scaling brands optimizing conversion rates.",
    monthlyPrice: 29,
    annualPrice: 23,
    popular: true,
    features: [
      "Up to 100,000 monthly page views",
      "Up to 5 Ecommerce storefronts",
      "Real-time visitor telemetry & heatmaps",
      "90-day data retention",
      "Advanced product click attribution",
      "Live friction & drop-off alerts",
      "Priority email support",
    ],
    buttonText: "Start 14-Day Free Trial",
    buttonVariant: "primary",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "For high-volume stores requiring custom telemetry.",
    monthlyPrice: 99,
    annualPrice: 79,
    popular: false,
    features: [
      "Unlimited monthly page views",
      "Unlimited storefronts",
      "365-day data retention",
      "Custom event webhooks & API access",
      "Dedicated account manager",
      "100% Cookieless GDPR compliance mode",
      "24/7 Priority support SLA",
    ],
    buttonText: "Contact Sales",
    buttonVariant: "outline",
  },
];

export const FAQS = [
  {
    question: "Does the StorePulse script slow down my storefront?",
    answer: "No. StorePulse uses a ultra-lightweight script (< 5KB) that loads asynchronously without blocking DOM parsing, page render time, or Core Web Vitals.",
  },
  {
    question: "How long does integration take on Shopify or WooCommerce?",
    answer: "Under 2 minutes. You simply paste one line of script into your storefront's theme header. StorePulse automatically begins tracking pageviews and visitor telemetry immediately.",
  },
  {
    question: "Is a credit card required for the 14-day free trial?",
    answer: "No credit card is required to sign up or start tracking. You get full access to live telemetry and analytics for 14 days without any commitment.",
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
