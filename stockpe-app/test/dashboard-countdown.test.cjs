const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");

const source = fs.readFileSync(path.join(__dirname, "../src/features/events/services/dashboardService.js"), "utf8")
  .replace(/^import .*;\s*/m, "")
  .replace(/export /g, "");
const context = vm.createContext({});
vm.runInContext(`${source}\nthis.toFeedCard = toFeedCard;`, context);

test("feed countdown uses the correct milestone for each status", () => {
  const now = Date.parse("2026-10-21T10:09:00Z");
  const contest = { opensAt: "2026-10-21T10:05:00Z", liveAt: "2026-10-21T10:10:00Z", closesAt: "2026-10-21T10:15:00Z", currentPrice: 1, changePercent: 0 };
  for (const [status, label, expected] of [["SOON", "OPENS IN", "00:00:00"], ["OPEN", "ENTRY CLOSES IN", "00:01:00"], ["LIVE", "CONTEST ENDS IN", "00:06:00"]]) {
    const card = context.toFeedCard({ ...contest, status }, now);
    assert.equal(card.timeLabel, label);
    assert.equal(card.closesIn, expected);
  }
  assert.equal(context.toFeedCard({ ...contest, status: "OPEN", liveAt: null }, now).closesIn, "00:06:00");
});
