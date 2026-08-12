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
