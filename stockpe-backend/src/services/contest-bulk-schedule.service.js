const IST_OFFSET = "+05:30";
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

function operationalError(message) {
    const error = new Error(message);
    error.statusCode = 400;
    error.isOperational = true;
    return error;
}

function asDateOnly(value, fieldName) {
    const text = String(value || "").trim();
    if (!DATE_PATTERN.test(text) || Number.isNaN(new Date(`${text}T00:00:00${IST_OFFSET}`).getTime())) {
        throw operationalError(`${fieldName} must be a valid YYYY-MM-DD date`);
    }
    return text;
}

function asTime(value, fieldName) {
    const text = String(value || "").trim();
    if (!TIME_PATTERN.test(text)) throw operationalError(`${fieldName} must be a valid HH:mm time`);
    return text;
}

function dateAtIst(date, time) {
    return new Date(`${date}T${time}:00${IST_OFFSET}`);
}

function nextDate(date) {
    const value = new Date(`${date}T00:00:00Z`);
    value.setUTCDate(value.getUTCDate() + 1);
    return value.toISOString().slice(0, 10);
}

function isWeekend(date) {
    const day = new Date(`${date}T00:00:00Z`).getUTCDay();
    return day === 0 || day === 6;
}

function buildTradingSchedule({ startDate, tradingDays, opensTime, liveTime, closesTime, excludedDates = [], now = new Date() }) {
    const start = asDateOnly(startDate, "startDate");
    const requestedDays = Number(tradingDays);
    if (!Number.isInteger(requestedDays) || requestedDays < 1 || requestedDays > 31) {
        throw operationalError("tradingDays must be an integer between 1 and 31");
    }
    const open = asTime(opensTime, "opensTime");
    const live = asTime(liveTime, "liveTime");
    const close = asTime(closesTime, "closesTime");
    if (!(open < live && live < close)) throw operationalError("opensTime must be before liveTime, which must be before closesTime");

    const excluded = new Set(excludedDates.map((date) => asDateOnly(date, "excludedDates")));
    const items = [];
    const skipped = [];
    let cursor = start;
    // A bounded search prevents a malformed client request from looping forever.
    for (let scanned = 0; items.length < requestedDays && scanned < 90; scanned += 1) {
        if (isWeekend(cursor)) skipped.push({ date: cursor, reason: "WEEKEND" });
        else if (excluded.has(cursor)) skipped.push({ date: cursor, reason: "EXCLUDED_DATE" });
        else {
            const opensAt = dateAtIst(cursor, open);
            if (opensAt <= now) skipped.push({ date: cursor, reason: "PAST_OPEN_TIME" });
            else items.push({ date: cursor, opensAt, liveAt: dateAtIst(cursor, live), closesAt: dateAtIst(cursor, close) });
        }
        cursor = nextDate(cursor);
    }
    if (items.length !== requestedDays) throw operationalError("Could not find enough eligible trading days in the next 90 calendar days");
    return { items, skipped };
}

function makePublicId(instrumentCode, date, sequence) {
    const code = String(instrumentCode).toLowerCase().replace(/[^a-z0-9]/g, "");
    return `${code}-${date.replace(/-/g, "")}-${String(sequence).padStart(2, "0")}`;
}

module.exports = { buildTradingSchedule, makePublicId };
