const crypto = require("crypto");
const pool = require("../config/database");
const { createNotification } = require("./profile-notification.service");

const PAYOUT_STATUSES = new Set(["PENDING_REVIEW", "APPROVED", "COMPLETED", "REJECTED", "FAILED"]);

function operationalError(statusCode, message) {
    const error = new Error(message);
    error.statusCode = statusCode;
    error.isOperational = true;
    return error;
}

function toAmount(value) {
    const amount = Number(value);
    if (!Number.isFinite(amount) || amount <= 0 || amount > 1000000) {
        throw operationalError(400, "amountUsdt must be a positive amount up to 1,000,000");
    }
    return amount.toFixed(6);
}

function maskMobile(mobile) {
    const value = String(mobile || "");
    return value.length < 4 ? "Hidden" : `${value.slice(0, 2)}******${value.slice(-2)}`;
}

async function withTransaction(work) {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const result = await work(client);
        await client.query("COMMIT");
        return result;
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}

async function audit(client, adminUserId, action, payoutId, metadata = {}) {
    await client.query(
        `INSERT INTO admin_audit_logs (admin_user_id, action, entity_type, entity_id, metadata)
         VALUES ($1, $2, 'DEMO_TEST_PAYOUT', $3, $4)`,
        [adminUserId, action, payoutId, metadata]
    );
}

async function listTestPayouts({ status = "ALL" } = {}) {
    const requested = String(status).toUpperCase();
    if (requested !== "ALL" && !PAYOUT_STATUSES.has(requested)) throw operationalError(400, "Invalid payout status");
    const where = requested === "ALL" ? "" : "WHERE payout.status=$1";
    const values = requested === "ALL" ? [] : [requested];
    const result = await pool.query(
        `SELECT payout.id, payout.amount_usdt::TEXT AS amount_usdt, payout.status, payout.network,
                payout.review_note, payout.simulated_transfer_id, payout.simulated_tx_hash,
                payout.created_at, payout.reviewed_at, payout.completed_at,
                contest.public_id, contest.title, users.mobile, wallet.address AS wallet_address
         FROM demo_contest_test_payouts payout
         JOIN demo_dashboard_contests contest ON contest.id=payout.contest_id
         JOIN users ON users.id=payout.user_id
         JOIN usdt_wallets wallet ON wallet.id=payout.usdt_wallet_id
         ${where}
         ORDER BY payout.created_at DESC`,
        values
    );
    return result.rows.map((row) => ({
        ...row,
        mobile: maskMobile(row.mobile),
        wallet_address: `${row.wallet_address.slice(0, 6)}...${row.wallet_address.slice(-4)}`,
        environment: "DEMO_TEST_ONLY",
    }));
}

async function createTestPayout({ adminUserId, publicId, entryId, amountUsdt, note }) {
    const amount = toAmount(amountUsdt);
    return withTransaction(async (client) => {
        const winner = await client.query(
            `SELECT contest.id AS contest_id, entry.id AS entry_id, entry.user_id, wallet.id AS wallet_id
             FROM demo_dashboard_contests contest
             JOIN demo_contest_entries entry ON entry.contest_id=contest.id
             JOIN usdt_wallets wallet ON wallet.user_id=entry.user_id AND wallet.network='TRC20'
             WHERE contest.public_id=$1 AND entry.id=$2
               AND contest.status='SETTLED' AND entry.status='WON'
             FOR UPDATE`,
            [publicId, entryId]
        );
        if (!winner.rowCount) throw operationalError(409, "A test payout requires a settled winner with a linked TRC20 wallet");
        const row = winner.rows[0];
        const created = await client.query(
            `INSERT INTO demo_contest_test_payouts
                (contest_id, contest_entry_id, user_id, usdt_wallet_id, amount_usdt, created_by_admin_id, review_note)
             VALUES ($1,$2,$3,$4,$5,$6,$7)
             RETURNING id, status, amount_usdt::TEXT AS amount_usdt, created_at`,
            [row.contest_id, row.entry_id, row.user_id, row.wallet_id, amount, adminUserId, String(note || "").trim() || null]
        );
        await audit(client, adminUserId, "DEMO_TEST_PAYOUT_CREATED", created.rows[0].id, { publicId, entryId, amountUsdt: amount });
        await createNotification(client, {
            userId: row.user_id,
            type: "DEMO_PAYOUT_PENDING",
            title: "Demo payout under review",
            message: `${amount} Demo USDT has been added for test review. No real USDT transfer has been initiated.`,
            metadata: { payoutId: created.rows[0].id, publicId, amountUsdt: amount, environment: "DEMO_TEST_ONLY" },
        });
        return { ...created.rows[0], environment: "DEMO_TEST_ONLY" };
    });
}

async function approveTestPayout({ adminUserId, payoutId, note }) {
    return withTransaction(async (client) => {
        const result = await client.query(
            `UPDATE demo_contest_test_payouts
             SET status='APPROVED', reviewed_by_admin_id=$1, reviewed_at=NOW(),
                 review_note=COALESCE(NULLIF($2, ''), review_note), updated_at=NOW()
             WHERE id=$3 AND status='PENDING_REVIEW'
             RETURNING id, status, amount_usdt::TEXT AS amount_usdt`,
            [adminUserId, String(note || "").trim(), payoutId]
        );
        if (!result.rowCount) throw operationalError(409, "Only a pending test payout can be approved");
        await audit(client, adminUserId, "DEMO_TEST_PAYOUT_APPROVED", payoutId, { note: String(note || "").trim() || null });
        return { ...result.rows[0], environment: "DEMO_TEST_ONLY" };
    });
}

async function completeTestPayout({ adminUserId, payoutId, note }) {
    return withTransaction(async (client) => {
        const transferId = `demo-test-transfer-${crypto.randomUUID()}`;
        const txHash = `demo-test-tx-${crypto.randomUUID()}`;
        const result = await client.query(
            `UPDATE demo_contest_test_payouts
             SET status='COMPLETED', reviewed_by_admin_id=$1, reviewed_at=COALESCE(reviewed_at, NOW()),
                 completed_at=NOW(), simulated_transfer_id=$2, simulated_tx_hash=$3,
                 review_note=COALESCE(NULLIF($4, ''), review_note), updated_at=NOW()
             WHERE id=$5 AND status='APPROVED'
             RETURNING id, user_id, amount_usdt::TEXT AS amount_usdt, status`,
            [adminUserId, transferId, txHash, String(note || "").trim(), payoutId]
        );
        if (!result.rowCount) throw operationalError(409, "Only an approved test payout can be marked completed");
        const payout = result.rows[0];
        await audit(client, adminUserId, "DEMO_TEST_PAYOUT_COMPLETED", payoutId, { transferId, txHash });
        await createNotification(client, {
            userId: payout.user_id,
            type: "DEMO_PAYOUT_COMPLETED",
            title: "Demo payout completed",
            message: `${payout.amount_usdt} Demo USDT was marked completed for testing. This is not a blockchain transaction or a real payout.`,
            metadata: { payoutId, transferId, txHash, amountUsdt: payout.amount_usdt, environment: "DEMO_TEST_ONLY" },
        });
        return { id: payout.id, status: payout.status, amount_usdt: payout.amount_usdt, simulated_transfer_id: transferId, simulated_tx_hash: txHash, environment: "DEMO_TEST_ONLY" };
    });
}

async function rejectTestPayout({ adminUserId, payoutId, note }) {
    const reason = String(note || "").trim();
    if (!reason) throw operationalError(400, "A rejection note is required");
    return withTransaction(async (client) => {
        const result = await client.query(
            `UPDATE demo_contest_test_payouts
             SET status='REJECTED', reviewed_by_admin_id=$1, reviewed_at=NOW(), review_note=$2, updated_at=NOW()
             WHERE id=$3 AND status IN ('PENDING_REVIEW', 'APPROVED')
             RETURNING id, user_id, amount_usdt::TEXT AS amount_usdt, status`,
            [adminUserId, reason, payoutId]
        );
        if (!result.rowCount) throw operationalError(409, "This test payout can no longer be rejected");
        const payout = result.rows[0];
        await audit(client, adminUserId, "DEMO_TEST_PAYOUT_REJECTED", payoutId, { note: reason });
        await createNotification(client, {
            userId: payout.user_id,
            type: "DEMO_PAYOUT_REJECTED",
            title: "Demo payout not approved",
            message: "The test payout was not approved. No real USDT was sent.",
            metadata: { payoutId, environment: "DEMO_TEST_ONLY" },
        });
        return { ...payout, environment: "DEMO_TEST_ONLY" };
    });
}

async function getUserTestPayouts(userId) {
    const result = await pool.query(
        `SELECT payout.id, payout.amount_usdt::TEXT AS amount_usdt, payout.status, payout.network,
                payout.simulated_tx_hash, payout.created_at, payout.completed_at, contest.title, contest.public_id
         FROM demo_contest_test_payouts payout
         JOIN demo_dashboard_contests contest ON contest.id=payout.contest_id
         WHERE payout.user_id=$1 ORDER BY payout.created_at DESC LIMIT 50`,
        [userId]
    );
    return result.rows.map((row) => ({ ...row, environment: "DEMO_TEST_ONLY" }));
}

module.exports = { approveTestPayout, completeTestPayout, createTestPayout, getUserTestPayouts, listTestPayouts, rejectTestPayout };
