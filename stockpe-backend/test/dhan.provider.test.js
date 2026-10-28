const test = require("node:test");
const assert = require("node:assert/strict");
const {
  fetchDhanQuotes,
  isDhanConfigured,
  normalizeQuote,
} = require("../src/services/market-providers/dhan.provider");

test("Dhan provider only activates with a selected provider and both backend credentials", () => {
  assert.equal(isDhanConfigured({ MARKET_DATA_PROVIDER: "dhan", DHAN_CLIENT_ID: "client", DHAN_ACCESS_TOKEN: "token" }), true);
  assert.equal(isDhanConfigured({ MARKET_DATA_PROVIDER: "dhan", DHAN_CLIENT_ID: "client" }), false);
  assert.equal(isDhanConfigured({ MARKET_DATA_PROVIDER: "yahoo", DHAN_CLIENT_ID: "client", DHAN_ACCESS_TOKEN: "token" }), false);
});

test("Dhan quote provider groups index IDs and normalizes the quote response", async () => {
  let request;
  const quotes = await fetchDhanQuotes([
    { symbol: "^NSEI", dhan: { exchangeSegment: "IDX_I", securityId: 13 } },
    { symbol: "^NSEBANK", dhan: { exchangeSegment: "IDX_I", securityId: 25 } },
  ], {
    env: { MARKET_DATA_PROVIDER: "dhan", DHAN_CLIENT_ID: "client", DHAN_ACCESS_TOKEN: "token" },
    fetchImpl: async (_url, options) => {
      request = options;
      return {
        ok: true,
        status: 200,
        json: async () => ({ data: { IDX_I: { 13: { last_price: 25000, net_change: 100, ohlc: { close: 24900 } }, 25: { last_price: 55000, net_change: -55, ohlc: { close: 55055 } } } } }),
      };
    },
  });

  assert.deepEqual(JSON.parse(request.body), { IDX_I: [13, 25] });
  assert.equal(request.headers["access-token"], "token");
  assert.equal(quotes.get("^NSEI").rawValue, 25000);
  assert.equal(quotes.get("^NSEBANK").changeValue, -55);
  assert.equal(normalizeQuote({ last_price: "invalid" }), null);
});
