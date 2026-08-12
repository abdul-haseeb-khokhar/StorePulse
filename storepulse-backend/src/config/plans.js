// Single source of truth for what each plan actually allows. sites.service.js
// enforces maxSites, ingest.service.js enforces maxMonthlyEvents — both read
// from here so the two limits can never drift out of sync with each other.
const PLAN_LIMITS = {
    Free: {maxSites: 1, maxMonthlyEvents: 10000},
    Pro: {maxSites: 5, maxMonthlyEvents: 100000},
    Business: {maxSites: Infinity, maxMonthlyEvents: Infinity},
};

const BILLING_CYCLE_DAYS = {
    monthly: 30,
    yearly: 365,
};

// A plan past its currentPeriodEnd has lapsed — treated as Free until an
// admin sets a fresh period (or, once real billing exists, a renewal
// webhook does). Checked lazily wherever a plan actually gates something
// (site creation, ingest quota) instead of a background job sweeping the
// whole subscriptions table on a schedule.
function resolveEffectivePlan(subscription) {
    if (!subscription) return 'Free';

    const {plan, currentPeriodEnd} = subscription;
    if (currentPeriodEnd && new Date(currentPeriodEnd) < new Date()) return 'Free';

    return plan || 'Free';
}

// Admins pick a billing cycle, not a date — this is what turns that choice
// into the actual currentPeriodEnd stored on the subscription.
function periodEndFromCycle(billingCycle) {
    const days = BILLING_CYCLE_DAYS[billingCycle] || BILLING_CYCLE_DAYS.monthly;
    return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

module.exports = {PLAN_LIMITS, resolveEffectivePlan, periodEndFromCycle};
