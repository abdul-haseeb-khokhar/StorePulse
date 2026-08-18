/**
 * Date helpers shared by the analytics module: formatting a date as a
 * lookup key, expanding a range into one entry per day, and defaulting an
 * unset range to "the last 7 days".
 */

/**
 * Formats a date as a UTC "YYYY-MM-DD" key, matching the day buckets
 * produced by DATE_TRUNC('day', ...) in analytics.repository.
 *
 * @param {Date|string} date
 * @returns {string}
 */
function formateDateKey(date) {
    const d = new Date(date);
    const yyyy = d.getUTCFullYear();
    const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(d.getUTCDate()).padStart(2, "0");

    return `${yyyy}-${mm}-${dd}`;
}

/**
 * Expands a date range into one key per day (inclusive of both ends), so
 * analytics series can be filled in with zeros for days that had no events.
 *
 * Normalized to UTC, not local midnight: "createdAt" is a naive `timestamp`
 * column, so Postgres stores exactly the UTC-equivalent value Prisma sends,
 * and DATE_TRUNC('day', ...) in analytics.repository truncates on that same
 * basis. Using local midnight here (as on a server running outside UTC)
 * would shift every day boundary and stop this list from lining up with the
 * DB's day buckets at all.
 *
 * @param {Date|string} startDate
 * @param {Date|string} endDate
 * @returns {string[]} Day keys from startDate to endDate, e.g. ["2026-08-01", "2026-08-02", ...].
 */
function buildDateRange(startDate, endDate) {
    const days = [];
    const current = new Date(startDate);
    current.setUTCHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setUTCHours(0, 0, 0, 0);

    while (current <= end) {
        days.push(formateDateKey(current));
        current.setUTCDate(current.getUTCDate() + 1)
    }

    return days;
}

/**
 * Fills in a missing start/end date pair with the default analytics window:
 * the 7 days up to and including today.
 *
 * @param {Date|string|undefined} startDate
 * @param {Date|string|undefined} endDate
 * @returns {{startDate: Date, endDate: Date}}
 */
function resolveDateBoundary(startDate, endDate) {
    const defaultEnd = new Date();
    const defaultStart = new Date();
    defaultStart.setDate(defaultStart.getDate() - 7);

    return {
        startDate: startDate ? new Date(startDate) : defaultStart,
        endDate: endDate ? new Date(endDate) : defaultEnd,
    };
}

module.exports = {
    formateDateKey, buildDateRange, resolveDateBoundary
}
