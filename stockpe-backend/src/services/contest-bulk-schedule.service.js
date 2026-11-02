const IST_OFFSET = "+05:30";
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;
const CONTEST_TYPES = new Set(["DAY_OPEN", "ONE_HOUR", "MIDDAY", "CLOSING", "NEXT_DAY_CLOSE"]);

const CONTEST_TEMPLATE_RULES = {
    DAY_OPEN: { label: "Day Open Prediction", targetTime: "09:15", lockTime: "08:59", openMode: "PRIOR_CLOSE" },
    ONE_HOUR: { label: "10 AM Prediction", targetTime: "10:00", lockTime: "08:59", openMode: "PRIOR_CLOSE" },
    MIDDAY: { label: "Midday Prediction", targetTime: "12:00", lockTime: "10:45", openMode: "SAME_DAY" },
    CLOSING: { label: "Closing Prediction", targetTime: "15:30", lockTime: "09:00", openMode: "PRIOR_CLOSE" },
    NEXT_DAY_CLOSE: { label: "Next-day Closing Prediction", targetTime: "15:30", lockTime: "15:30", openMode: "PRIOR_DAY" },
};

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

function previousEligibleDate(date, excluded) {
    let cursor = new Date(`${date}T00:00:00Z`);
    for (let scanned = 0; scanned < 10; scanned += 1) {
        cursor.setUTCDate(cursor.getUTCDate() - 1);
        const candidate = cursor.toISOString().slice(0, 10);
        if (!isWeekend(candidate) && !excluded.has(candidate)) return candidate;
    }
    throw operationalError("Could not find a prior eligible trading date");
}

function buildTemplateSlot(date, contestType, excluded) {
    const rule = CONTEST_TEMPLATE_RULES[contestType];
    if (!rule) throw operationalError("Invalid contestType");
    const priorDate = previousEligibleDate(date, excluded);
    const opensAt = rule.openMode === "SAME_DAY"
        ? dateAtIst(date, "09:15")
        : rule.openMode === "PRIOR_CLOSE"
            ? dateAtIst(priorDate, "15:31")
            : dateAtIst(priorDate, "09:15");
    const liveAt = rule.openMode === "PRIOR_DAY"
        ? dateAtIst(priorDate, rule.lockTime)
        : dateAtIst(date, rule.lockTime);
    return { date, opensAt, liveAt, closesAt: dateAtIst(date, rule.targetTime), contestType, rule };
}

function buildTradingSchedule({ startDate, tradingDays, opensTime, liveTime, closesTime, contestType, excludedDates = [], now = new Date() }) {
    const start = asDateOnly(startDate, "startDate");
    const requestedDays = Number(tradingDays);
    if (!Number.isInteger(requestedDays) || requestedDays < 1 || requestedDays > 31) {
        throw operationalError("tradingDays must be an integer between 1 and 31");
    }
    const requestedType = contestType ? String(contestType).trim().toUpperCase() : null;
    if (requestedType && !CONTEST_TYPES.has(requestedType)) throw operationalError("Invalid contestType");
    const open = requestedType ? null : asTime(opensTime, "opensTime");
    const live = requestedType ? null : asTime(liveTime, "liveTime");
    const close = requestedType ? null : asTime(closesTime, "closesTime");
    if (!requestedType && !(open < live && live < close)) throw operationalError("opensTime must be before liveTime, which must be before closesTime");

    const excluded = new Set(excludedDates.map((date) => asDateOnly(date, "excludedDates")));
    const items = [];
    const skipped = [];
    let cursor = start;
    // A bounded search prevents a malformed client request from looping forever.
    for (let scanned = 0; items.length < requestedDays && scanned < 90; scanned += 1) {
        if (isWeekend(cursor)) skipped.push({ date: cursor, reason: "WEEKEND" });
        else if (excluded.has(cursor)) skipped.push({ date: cursor, reason: "EXCLUDED_DATE" });
        else {
            const slot = requestedType
                ? buildTemplateSlot(cursor, requestedType, excluded)
                : { date: cursor, opensAt: dateAtIst(cursor, open), liveAt: dateAtIst(cursor, live), closesAt: dateAtIst(cursor, close), contestType: null };
            if (slot.opensAt <= now) skipped.push({ date: cursor, reason: "PAST_OPEN_TIME" });
            else items.push(slot);
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

module.exports = { buildTradingSchedule, makePublicId, CONTEST_TEMPLATE_RULES };
