const test = require("node:test");
const assert = require("node:assert/strict");
const { buildTradingSchedule } = require("../src/services/contest-bulk-schedule.service");

test("bulk schedule skips weekends and explicitly excluded exchange holidays", () => {
    const { items, skipped } = buildTradingSchedule({
        startDate: "2026-10-30", // Friday
        tradingDays: 3,
        opensTime: "09:15",
        liveTime: "15:15",
        closesTime: "15:35",
        excludedDates: ["2026-11-02"],
        now: new Date("2026-10-01T00:00:00Z"),
    });
    assert.deepEqual(items.map((item) => item.date), ["2026-10-30", "2026-11-03", "2026-11-04"]);
    assert.deepEqual(skipped.map((item) => item.reason), ["WEEKEND", "WEEKEND", "EXCLUDED_DATE"]);
});

test("bulk schedule rejects an invalid lifecycle time order", () => {
    assert.throws(() => buildTradingSchedule({
        startDate: "2026-11-03", tradingDays: 1,
        opensTime: "15:15", liveTime: "09:15", closesTime: "15:35",
        now: new Date("2026-10-01T00:00:00Z"),
    }), /opensTime must be before liveTime/);
});
