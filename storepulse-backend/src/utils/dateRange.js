function formateDateKey(date) {
    const d = new Date(date);
    const yyyy = d.getUTCFullYear();
    const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(d.getUTCDate()).padStart(2, "0");

    return `${yyyy}-${mm}-${dd}`;
}

function buildDateRange(startDate, endDate) {
    const days = [];
    const current = new Date(startDate);
    const end = new Date(endDate);

    while (current < end) {
        days.push(formateDateKey(current));
        current.setDate(current.getDate() + 1)
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