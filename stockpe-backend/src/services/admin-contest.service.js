const pool = require("../config/database");
const { createNotification } = require("./profile-notification.service");

const CONTEST_STATUSES = new Set(["DRAFT", "SOON", "OPEN", "LIVE", "CLOSED", "SETTLED", "CANCELLED"]);
const TRANSITIONS = {
    DRAFT: new Set(["SOON", "CANCELLED"]),
    SOON: new Set(["OPEN", "CANCELLED"]),
    OPEN: new Set(["LIVE", "CANCELLED"]),
    LIVE: new Set(["CLOSED", "CANCELLED"]),
    CLOSED: new Set(["SETTLED", "CANCELLED"]),
    SETTLED: new Set(),
    CANCELLED: new Set(),
};

function operationalError(statusCode, message) {
    const error = new Error(message);
    error.statusCode = statusCode;
    error.isOperational = true;
    return error;
}

function asDate(value, fieldName) {
    const date = new Date(value);
    if (!value || Number.isNaN(date.getTime())) throw operationalError(400, `${fieldName} must be a valid date/time`);
    return date;
}

function validateContestInput(input) {
    const title = String(input.title || "").trim();
    const question = String(input.question || "").trim();
    const publicId = String(input.publicId || "").trim().toLowerCase();
    const instrumentCode = String(input.instrumentCode || "").trim().toUpperCase();
    const entryCredits = Number(input.entryCredits);
    const prizePoolCredits = Number(input.prizePoolCredits);
    const playerCapacity = Number(input.playerCapacity);
    const opensAt = asDate(input.opensAt, "opensAt");
    const closesAt = asDate(input.closesAt, "closesAt");
    const lifecycleMode = String(input.lifecycleMode || "MANUAL").trim().toUpperCase();
    const liveAt = lifecycleMode === "SCHEDULED" ? asDate(input.liveAt, "liveAt") : null;

    if (!title || !question || !instrumentCode || !/^[a-z0-9-]{3,80}$/.test(publicId)) {
        throw operationalError(400, "title, question, instrumentCode, and a valid publicId are required");
    }
    if (![entryCredits, prizePoolCredits, playerCapacity].every(Number.isInteger) || entryCredits <= 0 || prizePoolCredits <= 0 || playerCapacity <= 0) {
        throw operationalError(400, "entryCredits, prizePoolCredits, and playerCapacity must be positive integers");
    }
    if (!["MANUAL", "SCHEDULED"].includes(lifecycleMode)) throw operationalError(400, "lifecycleMode must be MANUAL or SCHEDULED");
    if (closesAt <= opensAt) throw operationalError(400, "closesAt must be after opensAt");
    if (lifecycleMode === "SCHEDULED" && (liveAt <= opensAt || liveAt >= closesAt)) throw operationalError(400, "liveAt must be after opensAt and before closesAt");

    return { title, question, publicId, instrumentCode, entryCredits, prizePoolCredits, playerCapacity, opensAt, liveAt, closesAt, lifecycleMode };
}

async function audit(client, adminUserId, action, contestId, metadata = {}) {
    await client.query(
        `INSERT INTO admin_audit_logs (admin_user_id, action, entity_type, entity_id, metadata)
         VALUES ($1, $2, 'DEMO_CONTEST', $3, $4)`,
        [adminUserId, action, contestId, metadata]
    );
}

async function listContests({ status = "ALL" }) {
    const requested = String(status).toUpperCase();
    if (requested !== "ALL" && !CONTEST_STATUSES.has(requested)) throw operationalError(400, "Invalid contest status");
    const values = requested === "ALL" ? [] : [requested];
    const where = requested === "ALL" ? "" : "WHERE contest.status = $1";
    const result = await pool.query(
        `SELECT contest.public_id, contest.title, contest.question, contest.status, contest.entry_credits,
                contest.prize_pool_credits, contest.player_capacity, contest.player_count, contest.opens_at,
                contest.live_at, contest.closes_at, contest.lifecycle_mode, contest.settlement_source, contest.cancelled_at, contest.cancelled_reason,
                contest.settled_at, contest.settlement_value, instrument.code AS instrument_code, instrument.display_name AS instrument_name
         FROM demo_dashboard_contests contest
         JOIN market_instruments instrument ON instrument.id = contest.instrument_id
         ${where}
         ORDER BY contest.opens_at DESC`,
        values
    );
    return result.rows;
}

async function createContest({ adminUserId, input }) {
    const contest = validateContestInput(input);
    const settlementSource = String(input.settlementSource || "Demo market reference").trim();
    const status = String(input.status || "DRAFT").toUpperCase();
    if (!new Set(["DRAFT", "SOON"]).has(status)) throw operationalError(400, "New contests must start as DRAFT or SOON");

    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const instrument = await client.query("SELECT id FROM market_instruments WHERE code = $1 AND is_active = TRUE", [contest.instrumentCode]);
        if (!instrument.rowCount) throw operationalError(400, "Active instrument was not found");
        const result = await client.query(
            `INSERT INTO demo_dashboard_contests (
                public_id, instrument_id, title, question, status, entry_credits, prize_pool_credits,
                player_capacity, opens_at, live_at, closes_at, lifecycle_mode, settlement_source, display_order
             ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
             RETURNING id, public_id, status`,
            [contest.publicId, instrument.rows[0].id, contest.title, contest.question, status, contest.entryCredits,
                contest.prizePoolCredits, contest.playerCapacity, contest.opensAt, contest.liveAt, contest.closesAt, contest.lifecycleMode, settlementSource,
                Number.isInteger(input.displayOrder) ? input.displayOrder : 0]
        );
        await audit(client, adminUserId, "CONTEST_CREATED", result.rows[0].id, { publicId: contest.publicId, status });
        await client.query("COMMIT");
        return result.rows[0];
    } catch (error) {
        await client.query("ROLLBACK");
        if (error.code === "23505") throw operationalError(409, "A contest with this publicId already exists");
        throw error;
    } finally {
        client.release();
    }
}

async function updateContest({ adminUserId, publicId, input }) {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const existing = await client.query("SELECT id, status, lifecycle_mode, live_at FROM demo_dashboard_contests WHERE public_id = $1 FOR UPDATE", [publicId]);
        if (!existing.rowCount) throw operationalError(404, "Demo contest was not found");
        if (!["DRAFT", "SOON"].includes(existing.rows[0].status)) throw operationalError(409, "Only DRAFT or SOON contests can be edited");
        const contest = validateContestInput({ ...input, publicId, lifecycleMode: input.lifecycleMode || existing.rows[0].lifecycle_mode, liveAt: input.liveAt || existing.rows[0].live_at });
        const instrument = await client.query("SELECT id FROM market_instruments WHERE code = $1 AND is_active = TRUE", [contest.instrumentCode]);
        if (!instrument.rowCount) throw operationalError(400, "Active instrument was not found");
        await client.query(
            `UPDATE demo_dashboard_contests SET instrument_id=$1,title=$2,question=$3,entry_credits=$4,
             prize_pool_credits=$5,player_capacity=$6,opens_at=$7,live_at=$8,closes_at=$9,lifecycle_mode=$10,settlement_source=$11,
             display_order=$12,updated_at=NOW() WHERE id=$13`,
            [instrument.rows[0].id, contest.title, contest.question, contest.entryCredits, contest.prizePoolCredits,
                contest.playerCapacity, contest.opensAt, contest.liveAt, contest.closesAt, contest.lifecycleMode,
                String(input.settlementSource || "Demo market reference").trim(), Number.isInteger(input.displayOrder) ? input.displayOrder : 0,
                existing.rows[0].id]
        );
        await audit(client, adminUserId, "CONTEST_UPDATED", existing.rows[0].id, { publicId });
        await client.query("COMMIT");
        return { publicId, status: existing.rows[0].status };
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}

async function settleEntries(client, contestId, outcomes) {
    if (!Array.isArray(outcomes)) throw operationalError(400, "Settlement outcomes are required");
    const activeEntries = await client.query(
        "SELECT id, user_id, entry_credits FROM demo_contest_entries WHERE contest_id=$1 AND status='ACTIVE' FOR UPDATE",
        [contestId]
    );
    const submitted = new Map(outcomes.map((outcome) => [outcome.entryId, outcome]));
    if (submitted.size !== activeEntries.rowCount || activeEntries.rows.some((entry) => !submitted.has(entry.id))) {
        throw operationalError(400, "Provide one settlement outcome for every active entry");
    }

    for (const entry of activeEntries.rows) {
        const outcome = submitted.get(entry.id);
        const entryStatus = String(outcome.status || "").toUpperCase();
        const rewardCredits = Number(outcome.rewardCredits || 0);
        if (!["WON", "LOST"].includes(entryStatus) || !Number.isInteger(rewardCredits) || rewardCredits < 0) {
            throw operationalError(400, "Each settlement outcome needs WON or LOST and a non-negative whole rewardCredits value");
        }
        if (entryStatus === "LOST" && rewardCredits !== 0) throw operationalError(400, "A LOST entry cannot receive reward credits");
        await client.query(
            "UPDATE demo_contest_entries SET status=$1,settled_at=NOW() WHERE id=$2",
            [entryStatus, entry.id]
        );
        await client.query(
            `UPDATE demo_credit_accounts SET reserved_credits=reserved_credits-$1,
             available_credits=available_credits+$2,updated_at=NOW() WHERE user_id=$3`,
            [entry.entry_credits, rewardCredits, entry.user_id]
        );
        if (rewardCredits > 0) {
            await client.query(
                `INSERT INTO demo_credit_activity (user_id,entry_id,activity_type,amount_credits)
                 VALUES ($1,$2,'CONTEST_REWARD',$3)`, [entry.user_id, entry.id, rewardCredits]
            );
        }
    }
}

async function settleContest({ adminUserId, publicId, closingValue, settlementNotes }) {
    const finalValue = Number(closingValue);
    if (!Number.isFinite(finalValue) || finalValue <= 0) throw operationalError(400, "closingValue must be a positive number");
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const contestResult = await client.query(
            `SELECT id, status, prize_pool_credits FROM demo_dashboard_contests
             WHERE public_id=$1 FOR UPDATE`, [publicId]
        );
        if (!contestResult.rowCount) throw operationalError(404, "Demo contest was not found");
        const contest = contestResult.rows[0];
        if (contest.status !== "CLOSED") throw operationalError(409, "Only CLOSED contests can be settled");

        const entriesResult = await client.query(
            `SELECT id, user_id, entry_credits, prediction_value
             FROM demo_contest_entries WHERE contest_id=$1 AND status='ACTIVE'
             ORDER BY joined_at ASC FOR UPDATE`, [contest.id]
        );
        const entries = entriesResult.rows;
        const predictedEntries = entries.filter((entry) => entry.prediction_value !== null);
        const closestDistance = predictedEntries.length
            ? Math.min(...predictedEntries.map((entry) => Math.abs(Number(entry.prediction_value) - finalValue)))
            : null;
        const winnerIds = new Set(
            predictedEntries
                .filter((entry) => Math.abs(Number(entry.prediction_value) - finalValue) === closestDistance)
                .map((entry) => entry.id)
        );
        const baseReward = winnerIds.size ? Math.floor(Number(contest.prize_pool_credits) / winnerIds.size) : 0;
        let remainder = winnerIds.size ? Number(contest.prize_pool_credits) % winnerIds.size : 0;

        for (const entry of entries) {
            const isWinner = winnerIds.has(entry.id);
            const rewardCredits = isWinner ? baseReward + (remainder-- > 0 ? 1 : 0) : 0;
            await client.query(
                `UPDATE demo_contest_entries SET status=$1,reward_credits=$2,settled_at=NOW() WHERE id=$3`,
                [isWinner ? "WON" : "LOST", rewardCredits, entry.id]
            );
            await client.query(
                `UPDATE demo_credit_accounts SET reserved_credits=reserved_credits-$1,
                 available_credits=available_credits+$2,updated_at=NOW() WHERE user_id=$3`,
                [entry.entry_credits, rewardCredits, entry.user_id]
            );
            if (rewardCredits > 0) {
                await client.query(
                    `INSERT INTO demo_credit_activity (user_id,entry_id,activity_type,amount_credits)
                     VALUES ($1,$2,'CONTEST_REWARD',$3)`, [entry.user_id, entry.id, rewardCredits]
                );
            }
            await createNotification(client, { userId: entry.user_id, type: isWinner ? "CONTEST_WON" : "CONTEST_LOST", title: isWinner ? "Contest result: You won" : "Contest result: Not this time", message: isWinner ? `${contestResult.rows[0].prize_pool_credits} demo-credit pool was settled. Your reward is ${rewardCredits} credits.` : "Your contest prediction has been settled.", metadata: { publicId, rewardCredits, closingValue: finalValue } });
        }
        await client.query(
            `UPDATE demo_dashboard_contests SET status='SETTLED',settled_at=NOW(),settlement_value=$1,
             settlement_notes=$2,updated_at=NOW() WHERE id=$3`,
            [finalValue, String(settlementNotes || "").trim() || null, contest.id]
        );
        await audit(client, adminUserId, "CONTEST_SETTLED", contest.id, {
            publicId, closingValue: finalValue, winnerCount: winnerIds.size,
        });
        await client.query("COMMIT");
        return { publicId, closingValue: finalValue, winnerCount: winnerIds.size, status: "SETTLED" };
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}

async function changeContestStatus({ adminUserId, publicId, status, reason, settlementNotes, outcomes }) {
    const nextStatus = String(status || "").toUpperCase();
    if (!CONTEST_STATUSES.has(nextStatus)) throw operationalError(400, "Invalid contest status");
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const contest = await client.query("SELECT id, status FROM demo_dashboard_contests WHERE public_id=$1 FOR UPDATE", [publicId]);
        if (!contest.rowCount) throw operationalError(404, "Demo contest was not found");
        const current = contest.rows[0].status;
        if (!TRANSITIONS[current].has(nextStatus)) throw operationalError(409, `Cannot move contest from ${current} to ${nextStatus}`);
        if (nextStatus === "SETTLED") throw operationalError(400, "Use the settlement endpoint with a closingValue");
        if (nextStatus === "CANCELLED" && !String(reason || "").trim()) throw operationalError(400, "A cancellation reason is required");

        if (nextStatus === "CANCELLED") {
            const entries = await client.query(
                `UPDATE demo_contest_entries SET status='CANCELLED', settled_at=NOW()
                 WHERE contest_id=$1 AND status='ACTIVE' RETURNING id,user_id,entry_credits`, [contest.rows[0].id]
            );
            for (const entry of entries.rows) {
                await client.query(
                    `UPDATE demo_credit_accounts SET available_credits=available_credits+$1,
                     reserved_credits=reserved_credits-$1,updated_at=NOW() WHERE user_id=$2`,
                    [entry.entry_credits, entry.user_id]
                );
                await createNotification(client, { userId: entry.user_id, type: "CONTEST_CANCELLED", title: "Contest cancelled", message: `Your ${entry.entry_credits} demo credits were released.`, metadata: { publicId, entryId: entry.id } });
                await client.query(
                    `INSERT INTO demo_credit_activity (user_id,entry_id,activity_type,amount_credits)
                     VALUES ($1,$2,'CONTEST_RELEASED',$3)`, [entry.user_id, entry.id, entry.entry_credits]
                );
            }
        }
        if (nextStatus === "SETTLED") await settleEntries(client, contest.rows[0].id, outcomes);

        await client.query(
            `UPDATE demo_dashboard_contests SET status=$1, cancelled_at=CASE WHEN $1='CANCELLED' THEN NOW() ELSE cancelled_at END,
             cancelled_reason=CASE WHEN $1='CANCELLED' THEN $2 ELSE cancelled_reason END,
             settled_at=CASE WHEN $1='SETTLED' THEN NOW() ELSE settled_at END,
             settlement_notes=CASE WHEN $1='SETTLED' THEN $3 ELSE settlement_notes END, updated_at=NOW()
             WHERE id=$4`, [nextStatus, String(reason || "").trim() || null, String(settlementNotes || "").trim() || null, contest.rows[0].id]
        );
        await audit(client, adminUserId, `CONTEST_${nextStatus}`, contest.rows[0].id, {
            publicId, previousStatus: current, reason: reason || null,
            outcomeCount: nextStatus === "SETTLED" ? outcomes.length : undefined,
        });
        await client.query("COMMIT");
        return { publicId, previousStatus: current, status: nextStatus };
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}

async function getContestEntries(publicId) {
    const result = await pool.query(
        `SELECT entry.id, entry.status, entry.entry_credits, entry.prediction_value, entry.reward_credits, entry.joined_at, users.mobile
         FROM demo_contest_entries entry
         JOIN demo_dashboard_contests contest ON contest.id=entry.contest_id
         JOIN users ON users.id=entry.user_id
         WHERE contest.public_id=$1 ORDER BY entry.joined_at DESC`, [publicId]
    );
    return result.rows.map((row) => ({ ...row, mobile: `${row.mobile.slice(0, 2)}******${row.mobile.slice(-2)}` }));
}

module.exports = { changeContestStatus, createContest, getContestEntries, listContests, settleContest, updateContest };
