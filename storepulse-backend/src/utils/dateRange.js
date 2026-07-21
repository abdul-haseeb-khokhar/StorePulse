function formateDateKey(date) {
    return new Date(date).toISOString().split("T")[0];
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