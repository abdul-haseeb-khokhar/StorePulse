function formateDateKey(date) {
    return new Date(date).toISOString().split("T")[0];
}

function buildDateRange(startDate, endDate) {
    const days = [];
    const current = new Date(startDate);

    while (current < endDate) {
        days.push(formateDateKey(current));
        current.setDate(current.getDate() + 1)
    }

    return days;
}

module.exports = {
    formateDateKey, buildDateRange
}