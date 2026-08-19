/**
 * Formatting/derivation helpers shared by the authenticated Dashboard and
 * the public (no-auth) PublicDashboard — both render the same
 * summary/traffic/top-products/top-referrers shapes from the analytics
 * API, so anything that turns those numbers into display text lives here
 * once instead of drifting between the two pages.
 */

export const rangeLabels = {
  "7d": "7 days",
  "30d": "30 days",
  "90d": "90 days",
};

export const RANGE_DAYS = { "7d": 7, "30d": 30, "90d": 90 };

// The top-products/top-referrers endpoints take an explicit startDate/
// endDate boundary rather than the `range` shorthand summary/traffic use —
// mirrors analytics.controller.js's own getDateRangeFromQuery mapping so
// every panel on a given page shows the same window.
export function getDateBoundaryParams(range) {
  const days = RANGE_DAYS[range] || 30;
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  return { startDate: startDate.toISOString(), endDate: endDate.toISOString() };
}

export function formatNumber(value) {
  return new Intl.NumberFormat().format(value || 0);
}

export function formatTrend(change) {
  const prefix = change > 0 ? "+" : "";
  return `${prefix}${change || 0}%`;
}

export function formatChartDate(date) {
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(
    new Date(`${date}T00:00:00`),
  );
}

function trendDirection(change) {
  return change < 0 ? "down" : change === 0 ? "flat" : "up";
}

/** Turns a /summary response's `summary` object into the 3 StatCard props both dashboards render. */
export function buildStatCards(summary) {
  if (!summary) return [];

  return [
    {
      label: "Page views",
      value: formatNumber(summary.pageViews.value),
      trend: formatTrend(summary.pageViews.change),
      trendDirection: trendDirection(summary.pageViews.change),
    },
    {
      label: "Product clicks",
      value: formatNumber(summary.productClicks.value),
      trend: formatTrend(summary.productClicks.change),
      trendDirection: trendDirection(summary.productClicks.change),
    },
    {
      label: "Unique visitors",
      value: formatNumber(summary.uniqueVisitors.value),
      trend: formatTrend(summary.uniqueVisitors.change),
      trendDirection: trendDirection(summary.uniqueVisitors.change),
    },
  ];
}
