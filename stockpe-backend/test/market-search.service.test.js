const test = require("node:test");
const assert = require("node:assert/strict");

const { getContestInstrumentMatches } = require("../src/services/market.service");

test("market search exposes only existing demo contest instruments", () => {
  const results = getContestInstrumentMatches("nifty");
  assert.deepEqual(
    results.map((result) => result.instrumentCode),
    ["NIFTY50", "BANKNIFTY", "NIFTYMIDCAP100"]
  );
});

test("market search accepts a known raw provider symbol", () => {
  const results = getContestInstrumentMatches("^BSESN");
  assert.equal(results.length, 1);
  assert.equal(results[0].instrumentCode, "SENSEX");
});

test("market search can return the complete supported contest instrument catalog", () => {
  assert.equal(getContestInstrumentMatches("all").length, 4);
});

test("market search does not offer unsupported stocks for contest creation", () => {
  assert.deepEqual(getContestInstrumentMatches("reliance"), []);
});
