const pool = require("../config/database");
const { createNotification } = require("./profile-notification.service");

async function withTransaction(work) {
    const client = await pool.connect();
    try { await client.query("BEGIN"); const result = await work(client); await client.query("COMMIT"); return result; }
    catch (error) { await client.query("ROLLBACK"); throw error; }
    finally { client.release(); }
}

function operationalError(statusCode, message) {
    const error = new Error(message); error.statusCode = statusCode; error.isOperational = true; return error;
}

async function ensureAccount(client, userId) {
    const result = await client.query(
        `INSERT INTO demo_credit_accounts (user_id) VALUES ($1)
         ON CONFLICT (user_id) DO UPDATE SET user_id = EXCLUDED.user_id
         RETURNING available_credits, reserved_credits`, [userId]
    );
    return result.rows[0];
}

async function getDemoCreditBalance({ userId }) {
    await pool.query(
        "INSERT INTO demo_credit_accounts (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING",
        [userId]
    );
    const result = await pool.query(
        "SELECT available_credits, reserved_credits FROM demo_credit_accounts WHERE user_id = $1",
        [userId]
    );
    const account = result.rows[0];
    return {
        availableCredits: Number(account.available_credits),
        reservedCredits: Number(account.reserved_credits),
    };
}

function normalizePredictionValue(value) {
    if (value === undefined || value === null || value === "") return null;
    const predictionValue = Number(value);
    if (!Number.isFinite(predictionValue) || predictionValue <= 0) {
        throw operationalError(400, "predictionValue must be a positive number");
    }
    return Math.round(predictionValue * 10000) / 10000;
}

async function joinDemoContest({ userId, publicId, predictionValue }) {
    const normalizedPredictionValue = normalizePredictionValue(predictionValue);
    return withTransaction(async (client) => {
        const contest = await client.query(
            `SELECT id, title, entry_credits, status FROM demo_dashboard_contests
             WHERE public_id = $1 FOR UPDATE`, [publicId]
        );
        if (!contest.rowCount) throw operationalError(404, "Demo contest was not found");
        const row = contest.rows[0];
        if (row.status !== "OPEN") throw operationalError(409, "This demo contest is not open for entry");
        const account = await ensureAccount(client, userId);
        if (account.available_credits < row.entry_credits) throw operationalError(409, "Insufficient demo credits");
        const entry = await client.query(
            `INSERT INTO demo_contest_entries (contest_id, user_id, entry_credits, prediction_value)
             VALUES ($1, $2, $3, $4) ON CONFLICT (contest_id, user_id) DO NOTHING
             RETURNING id, status, joined_at, prediction_value`,
            [row.id, userId, row.entry_credits, normalizedPredictionValue]
        );
        if (!entry.rowCount) throw operationalError(409, "You have already joined this demo contest");
        await client.query(
            `UPDATE demo_credit_accounts SET available_credits = available_credits - $1,
             reserved_credits = reserved_credits + $1, updated_at = NOW() WHERE user_id = $2`, [row.entry_credits, userId]
        );
        await client.query(
            `INSERT INTO demo_credit_activity (user_id, entry_id, activity_type, amount_credits)
             VALUES ($1, $2, 'CONTEST_RESERVED', $3)`, [userId, entry.rows[0].id, row.entry_credits]
        );
        await createNotification(client, { userId, type: "CONTEST_JOINED", title: "Prediction submitted", message: `Your prediction for ${row.title} is active.`, metadata: { contestId: publicId, entryId: entry.rows[0].id } });
        return { entry: { id: entry.rows[0].id, contestId: publicId, contestTitle: row.title, status: entry.rows[0].status, entryCredits: row.entry_credits, predictionValue: entry.rows[0].prediction_value, joinedAt: entry.rows[0].joined_at } };
    });
}

async function getMyDemoContests({ userId, status = "ALL" }) {
    const requested = String(status).toUpperCase();
    if (!["ALL", "ACTIVE", "WON", "LOST"].includes(requested)) throw operationalError(400, "status must be ALL, ACTIVE, WON, or LOST");
    const values = requested === "ALL" ? [userId] : [userId, requested];
    const clause = requested === "ALL" ? "" : "AND entry.status = $2";
    const result = await pool.query(
        `SELECT entry.id, entry.status, entry.entry_credits, entry.prediction_value, entry.reward_credits, entry.joined_at,
                contest.public_id, contest.title, contest.settlement_value
         FROM demo_contest_entries entry JOIN demo_dashboard_contests contest ON contest.id = entry.contest_id
         WHERE entry.user_id = $1 ${clause} ORDER BY entry.joined_at DESC`, values
    );
    return { status: requested, entries: result.rows };
}

module.exports = { getDemoCreditBalance, getMyDemoContests, joinDemoContest };
