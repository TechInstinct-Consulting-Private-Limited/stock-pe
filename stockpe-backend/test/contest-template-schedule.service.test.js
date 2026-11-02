const test = require("node:test");
const assert = require("node:assert/strict");
const { buildTradingSchedule } = require("../src/services/contest-bulk-schedule.service");

test("Day Open template locks before pre-open and settles at 09:15 IST", () => {
  const result = buildTradingSchedule({ startDate: "2026-11-03", tradingDays: 1, contestType: "DAY_OPEN", now: new Date("2026-10-30T00:00:00Z") });
  assert.equal(result.items[0].opensAt.toISOString(), "2026-11-02T10:01:00.000Z");
  assert.equal(result.items[0].liveAt.toISOString(), "2026-11-03T03:29:00.000Z");
  assert.equal(result.items[0].closesAt.toISOString(), "2026-11-03T03:45:00.000Z");
});

test("Next-day Close template locks on prior trading day and settles next close", () => {
  const result = buildTradingSchedule({ startDate: "2026-11-03", tradingDays: 1, contestType: "NEXT_DAY_CLOSE", now: new Date("2026-10-30T00:00:00Z") });
  assert.equal(result.items[0].liveAt.toISOString(), "2026-11-02T10:00:00.000Z");
  assert.equal(result.items[0].closesAt.toISOString(), "2026-11-03T10:00:00.000Z");
});
