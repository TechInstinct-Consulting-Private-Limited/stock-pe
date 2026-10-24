const test = require("node:test");
const assert = require("node:assert/strict");

process.env.DB_HOST = process.env.DB_HOST || "127.0.0.1";
process.env.DB_NAME = process.env.DB_NAME || "stockpe_test";
process.env.DB_USER = process.env.DB_USER || "stockpe_test";

const { getScheduledTransitions } = require("../src/services/contest-lifecycle.service");

test("scheduled contest lifecycle uses the user-visible status order", () => {
    assert.deepEqual(getScheduledTransitions(), [
        { previousStatus: "SOON", nextStatus: "OPEN", dueColumn: "opens_at" },
        { previousStatus: "OPEN", nextStatus: "LIVE", dueColumn: "live_at" },
        { previousStatus: "LIVE", nextStatus: "CLOSED", dueColumn: "closes_at" },
    ]);
});