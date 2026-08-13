// Relative instead of an absolute date on purpose: currentPeriodEnd is a
// UTC instant, and formatting it as a calendar date would show a different
// day depending on the viewer's own timezone (the exact same stored moment
// can land on either side of midnight). A day count computed from the raw
// duration has no such ambiguity — everyone sees the same number. Shared
// between the admin panel and the user's own Settings page so both report
// the same thing the same way.
export function formatDaysRemaining(periodEnd) {
  const msRemaining = new Date(periodEnd).getTime() - Date.now();
  if (msRemaining <= 0) return "Access expired";

  const daysRemaining = Math.ceil(msRemaining / (24 * 60 * 60 * 1000));
  return `${daysRemaining} day${daysRemaining === 1 ? "" : "s"} remaining`;
}

// SubscriptionHistory.reason (subscription.service.js) is a stable code,
// not display text — kept that way so it's greppable/stringly-typed the
// same way everywhere it's written, and translated to a human label only
// here, at the one place both the user's own Settings page and the admin
// user-detail page render it.
const HISTORY_REASON_LABELS = {
  "admin:plan-change": "Updated by admin",
  "system:period-expired": "Plan expired",
  "system:scheduled-cancel-applied": "Moved to Free (cancellation took effect)",
  "user:cancel-requested": "Cancellation requested",
};

export function formatHistoryReason(reason) {
  return HISTORY_REASON_LABELS[reason] || reason;
}
