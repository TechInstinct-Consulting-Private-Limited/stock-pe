const test = require("node:test");
const assert = require("node:assert/strict");

process.env.DB_HOST ||= "127.0.0.1";
process.env.DB_NAME ||= "stockpe_test";
process.env.DB_USER ||= "stockpe_test";
const pool = require("../src/config/database");
const { linkUsdtWallet } = require("../src/services/wallet.service");
const address = `T${"1".repeat(33)}`;

test("demo wallet linking does not require Aadhaar; production still does", async () => {
    const originalQuery = pool.query;
    const originalEnvironment = process.env.NODE_ENV;
    const queries = [];
    pool.query = async (sql) => {
        queries.push(sql);
        if (sql.includes("aadhaar_kyc_verifications")) return { rowCount: 0, rows: [] };
        if (sql.includes("SELECT id, network")) return { rowCount: 0, rows: [] };
        return { rowCount: 1, rows: [{ id: "wallet", network: "TRC20", address }] };
    };
    try {
        process.env.NODE_ENV = "development";
        const result = await linkUsdtWallet({ userId: "user", network: "TRC20", address });
        assert.equal(result.wallet.address, address);
        assert.equal(queries.some((sql) => sql.includes("aadhaar_kyc_verifications")), false);
        process.env.NODE_ENV = "production";
        await assert.rejects(linkUsdtWallet({ userId: "user", network: "TRC20", address }), /Complete Aadhaar KYC/);
    } finally {
        pool.query = originalQuery;
        if (originalEnvironment === undefined) delete process.env.NODE_ENV;
        else process.env.NODE_ENV = originalEnvironment;
    }
});
