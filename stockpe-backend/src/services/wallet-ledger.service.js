const USDT_DECIMALS = 6;
const DECIMAL_AMOUNT_PATTERN = /^\d+(?:\.\d{1,6})?$/;

function toAtomicUsdt(amount) {
    const normalized = String(amount ?? "").trim();
    if (!DECIMAL_AMOUNT_PATTERN.test(normalized)) {
        throw new Error("USDT amount must be a positive value with up to 6 decimal places");
    }

    const [whole, fraction = ""] = normalized.split(".");
    const atomic = BigInt(whole) * 10n ** BigInt(USDT_DECIMALS)
        + BigInt(fraction.padEnd(USDT_DECIMALS, "0"));

    if (atomic <= 0n) {
        throw new Error("USDT amount must be greater than zero");
    }

    return atomic;
}

function assertBalancedEntries(entries) {
    if (!Array.isArray(entries) || entries.length < 2) {
        throw new Error("A ledger transaction requires at least one debit and one credit entry");
    }

    let debits = 0n;
    let credits = 0n;

    for (const entry of entries) {
        const amount = toAtomicUsdt(entry.amountUsdt);
        if (entry.direction === "DEBIT") debits += amount;
        else if (entry.direction === "CREDIT") credits += amount;
        else throw new Error("Ledger entry direction must be DEBIT or CREDIT");
    }

    if (debits !== credits) {
        throw new Error("Ledger transaction debits and credits must balance exactly");
    }
}

module.exports = { assertBalancedEntries, toAtomicUsdt };
