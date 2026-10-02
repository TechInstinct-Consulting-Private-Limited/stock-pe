const test = require("node:test");
const assert = require("node:assert/strict");
const {
    assertBalancedEntries,
    toAtomicUsdt,
} = require("../src/services/wallet-ledger.service");

test("converts USDT decimal strings without floating-point rounding", () => {
    assert.equal(toAtomicUsdt("12.345678"), 12345678n);
    assert.equal(toAtomicUsdt("1"), 1000000n);
    assert.throws(() => toAtomicUsdt("0.0000001"));
});

test("accepts exactly balanced double-entry postings", () => {
    assert.doesNotThrow(() =>
        assertBalancedEntries([
            { direction: "DEBIT", amountUsdt: "2.5" },
            { direction: "CREDIT", amountUsdt: "2.500000" },
        ])
    );
});

test("rejects unbalanced ledger postings", () => {
    assert.throws(() =>
        assertBalancedEntries([
            { direction: "DEBIT", amountUsdt: "2.5" },
            { direction: "CREDIT", amountUsdt: "2.4" },
        ])
    );
});
