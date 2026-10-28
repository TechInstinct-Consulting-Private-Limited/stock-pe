const test = require("node:test");
const assert = require("node:assert/strict");

process.env.DB_HOST = process.env.DB_HOST || "127.0.0.1";
process.env.DB_NAME = process.env.DB_NAME || "stockpe_test";
process.env.DB_USER = process.env.DB_USER || "stockpe_test";

const { asSnapshotRows } = require("../src/services/market-snapshot.service");

test("dashboard snapshots include only fresh quotes for registered contest instruments", () => {
    const snapshots = asSnapshotRows([
        { rawSymbol: "^NSEI", rawValue: 22000, percentChange: 0.5 },
        { rawSymbol: "RELIANCE.NS", rawValue: 1400, percentChange: -0.2 },
        { rawSymbol: "^BSESN", rawValue: 71000, percentChange: -0.1 },
    ], ["^NSEI", "RELIANCE.NS"]);

    assert.deepEqual(snapshots, [{ code: "NIFTY50", value: 22000, changePercent: 0.5, provider: "unknown" }]);
});
