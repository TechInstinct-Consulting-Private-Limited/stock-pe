const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");

const source = fs.readFileSync(path.join(__dirname, "../src/features/events/services/dashboardService.js"), "utf8")
  .replace(/^import .*;\s*/m, "")
  .replace(/export /g, "");
const context = vm.createContext({});
vm.runInContext(`${source}\nthis.toFeedCard = toFeedCard; this.groupFeedCards = groupFeedCards;`, context);

test("feed countdown uses the correct milestone for each status", () => {
  const now = Date.parse("2026-10-21T10:09:00Z");
  const contest = { opensAt: "2026-10-21T10:05:00Z", liveAt: "2026-10-21T10:10:00Z", closesAt: "2026-10-21T10:15:00Z", currentPrice: 1, changePercent: 0 };
  for (const [status, label, expected] of [["SOON", "ENTRIES OPEN IN", "00:00:00"], ["OPEN", "ENTRY CLOSES IN", "00:01:00"], ["LIVE", "TARGET VALUE IN", "00:06:00"]]) {
    const card = context.toFeedCard({ ...contest, status }, now);
    assert.equal(card.timeLabel, label);
    assert.equal(card.closesIn, expected);
  }
  assert.equal(context.toFeedCard({ ...contest, status: "OPEN", liveAt: null }, now).closesIn, "00:06:00");
});

test("all-events presentation keeps today's prediction journey before upcoming contests", () => {
  const now = Date.parse("2026-11-03T04:00:00Z");
  const shared = { status: "SOON", opensAt: "2026-11-03T10:01:00Z", currentPrice: 1, changePercent: 0 };
  const cards = [
    context.toFeedCard({ ...shared, id: "closing", contestType: "CLOSING", liveAt: "2026-11-03T03:30:00Z", closesAt: "2026-11-03T10:00:00Z" }, now),
    context.toFeedCard({ ...shared, id: "open", contestType: "DAY_OPEN", liveAt: "2026-11-03T03:29:00Z", closesAt: "2026-11-03T03:45:00Z" }, now),
    context.toFeedCard({ ...shared, id: "tomorrow", contestType: "NEXT_DAY_CLOSE", liveAt: "2026-11-04T10:00:00Z", closesAt: "2026-11-05T10:00:00Z" }, now),
  ];
  const groups = context.groupFeedCards(cards, now);
  assert.equal(groups[0].id, "today");
  assert.equal(groups[0].cards.map((card) => card.id).join(","), "open,closing");
  assert.equal(groups[1].id, "upcoming");
  assert.equal(groups[1].cards.map((card) => card.id).join(","), "tomorrow");
});
