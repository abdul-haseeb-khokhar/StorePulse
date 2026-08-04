function formateDateKey(date) {
    const d = new Date(date);
    const yyyy = d.getUTCFullYear();
    const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(d.getUTCDate()).padStart(2, "0");

    return `${yyyy}-${mm}-${dd}`;
}

function buildDateRange(startDate, endDate) {
    // Normalized to UTC, not local midnight: "createdAt" is a naive
    // `timestamp` column, so Postgres stores exactly the UTC-equivalent
    // value Prisma sends, and DATE_TRUNC('day', ...) in analytics.repository
    // truncates on that same basis. Using local midnight here (as on a
    // server running outside UTC) would shift every day boundary and stop
    // this list from lining up with the DB's day buckets at all.
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