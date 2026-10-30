const test = require("node:test");
const assert = require("node:assert/strict");
const { isDhanLiveFeedEnabled, parseDhanPacket } = require("../src/services/dhan-live-feed.service");

function packet(responseCode, securityId, value) {
  const buffer = Buffer.alloc(12);
  buffer.writeUInt8(responseCode, 0);
  buffer.writeInt32LE(securityId, 4);
  buffer.writeFloatLE(value, 8);
  return buffer;
}

test("Dhan live feed only enables with explicit streaming and credentials", () => {
  assert.equal(isDhanLiveFeedEnabled({ MARKET_TICK_STREAM_ENABLED: "true", MARKET_DATA_PROVIDER: "dhan", DHAN_CLIENT_ID: "id", DHAN_ACCESS_TOKEN: "token" }), true);
  assert.equal(isDhanLiveFeedEnabled({ MARKET_DATA_PROVIDER: "dhan", DHAN_CLIENT_ID: "id", DHAN_ACCESS_TOKEN: "token" }), false);
});

test("parses little-endian Dhan ticker and previous close packets", () => {
  assert.deepEqual(parseDhanPacket(packet(2, 13, 22600.25)), { type: "ticker", securityId: 13, lastPrice: 22600.25 });
  assert.deepEqual(parseDhanPacket(packet(6, 13, 22500)), { type: "previous-close", securityId: 13, previousClose: 22500 });
  assert.equal(parseDhanPacket(Buffer.alloc(4)), null);
});
