const pool = require("../config/database");
const { createNotification } = require("./profile-notification.service");
const { toAtomicUsdt } = require('./wallet-ledger.service');
const { settleDemoUsdtEntry, refundDemoUsdtEntry, splitDemoUsdtPool, atomicToDemoUsdt } = require('./demo-usdt.service');

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
                EXISTS (SELECT 1 FROM demo_usdt_contests d WHERE d.contest_id=contest.id) AS is_demo_usdt,
                contest.prize_pool_credits, contest.player_capacity,
                (SELECT COUNT(*)::INTEGER FROM demo_contest_entries entry WHERE entry.contest_id=contest.id) AS player_count, contest.opens_at,
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
    const requestedStatus = String(input.status || "DRAFT").toUpperCase();
    if (!new Set(["DRAFT", "SOON"]).has(requestedStatus)) throw operationalError(400, "New contests must start as DRAFT or SOON");
    // Scheduled contests are published into SOON immediately. The scheduler alone
    // advances them through OPEN, LIVE, CLOSED, and automatic demo settlement.
    const status = contest.lifecycleMode === "SCHEDULED" ? "SOON" : requestedStatus;

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
        if (input.currency === 'DEMO_USDT') {
            await client.query(
                `INSERT INTO demo_usdt_contests (contest_id, entry_atomic, prize_pool_atomic) VALUES ($1,$2,$3)`,
                [result.rows[0].id, toAtomicUsdt(input.entryCredits).toString(), toAtomicUsdt(input.prizePoolCredits).toString()]
            );
        }
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

function calculateWinnerRewards(entries, finalValue, prizePoolCredits) {
    const predictedEntries = entries.filter((entry) => entry.prediction_value !== null);
    const closestDistance = predictedEntries.length
        ? Math.min(...predictedEntries.map((entry) => Math.abs(Number(entry.prediction_value) - finalValue)))
        : null;
    const winnerIds = new Set(
        predictedEntries
            .filter((entry) => Math.abs(Number(entry.prediction_value) - finalValue) === closestDistance)
            .map((entry) => entry.id)
    );
    const baseReward = winnerIds.size ? Math.floor(Number(prizePoolCredits) / winnerIds.size) : 0;
    let remainder = winnerIds.size ? Number(prizePoolCredits) % winnerIds.size : 0;

    return entries.map((entry) => {
        const isWinner = winnerIds.has(entry.id);
        const rewardCredits = isWinner ? baseReward + (remainder-- > 0 ? 1 : 0) : 0;
        return { entry, isWinner, rewardCredits };
    });
}

async function settleLockedContest({ client, contest, publicId, finalValue, settlementNotes, notificationPrefix = "" }) {
    const demoCurrency = await client.query('SELECT entry_atomic::text, prize_pool_atomic::text FROM demo_usdt_contests WHERE contest_id=$1', [contest.id]);
    const entriesResult = await client.query(
        `SELECT id, user_id, entry_credits, prediction_value
         FROM demo_contest_entries WHERE contest_id=$1 AND status='ACTIVE'
         ORDER BY joined_at ASC FOR UPDATE`, [contest.id]
    );
    const rewards = calculateWinnerRewards(entriesResult.rows, finalValue, contest.prize_pool_credits);
    const winnerCount = rewards.filter((reward) => reward.isWinner).length;
    const demoShares = demoCurrency.rowCount && winnerCount ? splitDemoUsdtPool(demoCurrency.rows[0].prize_pool_atomic, winnerCount) : [];
    let demoWinnerIndex = 0;
    const totalRewardCredits = rewards.reduce((total, reward) => total + reward.rewardCredits, 0);

    for (const { entry, isWinner, rewardCredits } of rewards) {
        const demoReward = demoCurrency.rowCount && isWinner ? demoShares[demoWinnerIndex++] : '0';
        await client.query(
            "UPDATE demo_contest_entries SET status=$1,reward_credits=$2,settled_at=NOW() WHERE id=$3",
            [isWinner ? "WON" : "LOST", rewardCredits, entry.id]
        );
        if (demoCurrency.rowCount) {
            await settleDemoUsdtEntry(client, { userId: entry.user_id, contestId: contest.id, entryId: entry.id, entryAtomic: demoCurrency.rows[0].entry_atomic, rewardAtomic: demoReward });
        } else await client.query(
            `UPDATE demo_credit_accounts SET reserved_credits=reserved_credits-$1,
             available_credits=available_credits+$2,updated_at=NOW() WHERE user_id=$3`,
            [entry.entry_credits, rewardCredits, entry.user_id]
        );
        if (!demoCurrency.rowCount && rewardCredits > 0) {
            await client.query(
                `INSERT INTO demo_credit_activity (user_id,entry_id,activity_type,amount_credits)
                 VALUES ($1,$2,'CONTEST_REWARD',$3)`, [entry.user_id, entry.id, rewardCredits]
            );
        }
        await createNotification(client, {
            userId: entry.user_id,
            type: isWinner ? "CONTEST_WON" : "CONTEST_LOST",
            title: isWinner ? "Contest result: You won" : "Contest result: Not this time",
            message: isWinner
                ? demoCurrency.rowCount ? `${notificationPrefix}Your reward is ${atomicToDemoUsdt(demoReward)} Demo USDT.` : `${notificationPrefix}${contest.prize_pool_credits} demo-credit pool was settled. Your reward is ${rewardCredits} credits.`
                : `${notificationPrefix}Your contest prediction has been settled.`,
            metadata: { publicId, rewardCredits, closingValue: finalValue, environment: "DEMO_ONLY" },
        });
    }

    await client.query(
        `UPDATE demo_dashboard_contests SET status='SETTLED',settled_at=NOW(),settlement_value=$1,
         settlement_notes=$2,updated_at=NOW() WHERE id=$3`,
        [finalValue, String(settlementNotes || "").trim() || null, contest.id]
    );
    if (totalRewardCredits > 0) {
        await client.query(
            `UPDATE demo_dashboard_metrics
             SET paid_out_credits=paid_out_credits+$1, updated_at=NOW()
             WHERE singleton=TRUE`,
            [totalRewardCredits]
        );
    }

    return { winnerCount, totalRewardCredits };
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

        const settlement = await settleLockedContest({ client, contest, publicId, finalValue, settlementNotes });
        await audit(client, adminUserId, "CONTEST_SETTLED", contest.id, {
            publicId, closingValue: finalValue, winnerCount: settlement.winnerCount,
        });
        await client.query("COMMIT");
        return { publicId, closingValue: finalValue, winnerCount: settlement.winnerCount, status: "SETTLED" };
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}

async function autoSettleScheduledContests() {
    const candidates = await pool.query(
        `SELECT public_id FROM demo_dashboard_contests
         WHERE lifecycle_mode='SCHEDULED' AND status='CLOSED'
         ORDER BY closes_at ASC
         LIMIT 50`
    );
    const settlements = [];

    for (const candidate of candidates.rows) {
        const client = await pool.connect();
        try {
            await client.query("BEGIN");
            const contestResult = await client.query(
                `SELECT id, public_id, status, prize_pool_credits, instrument_id, closes_at
                 FROM demo_dashboard_contests
                 WHERE public_id=$1 AND lifecycle_mode='SCHEDULED'
                 FOR UPDATE`,
                [candidate.public_id]
            );
            if (!contestResult.rowCount || contestResult.rows[0].status !== "CLOSED") {
                await client.query("COMMIT");
                continue;
            }

            const contest = contestResult.rows[0];
            const snapshotResult = await client.query(
                `SELECT value::TEXT AS value, observed_at, provider_key
                 FROM market_price_snapshots
                 WHERE instrument_id=$1
                   AND observed_at >= $2::timestamptz - INTERVAL '10 minutes'
                   AND observed_at <= $2::timestamptz + INTERVAL '10 minutes'
                 ORDER BY observed_at DESC
                 LIMIT 1`,
                [contest.instrument_id, contest.closes_at]
            );
            if (!snapshotResult.rowCount) {
                await client.query("COMMIT");
                continue;
            }

            const snapshot = snapshotResult.rows[0];
            const closingValue = Number(snapshot.value);
            if (!Number.isFinite(closingValue) || closingValue <= 0) {
                await client.query("COMMIT");
                continue;
            }

            const settlement = await settleLockedContest({
                client,
                contest,
                publicId: contest.public_id,
                finalValue: closingValue,
                settlementNotes: `Automatic demo settlement using ${snapshot.provider_key} snapshot observed near the scheduled closing time at ${snapshot.observed_at.toISOString()}. Not an official market close.`,
                notificationPrefix: "Automatic demo settlement: ",
            });
            await client.query(
                `INSERT INTO demo_contest_lifecycle_events
                 (contest_id, previous_status, next_status, trigger_source)
                 VALUES ($1,'CLOSED','SETTLED','SCHEDULER')`,
                [contest.id]
            );
            await client.query("COMMIT");
            settlements.push({
                publicId: contest.public_id,
                closingValue,
                winnerCount: settlement.winnerCount,
                totalRewardCredits: settlement.totalRewardCredits,
                status: "SETTLED",
            });
        } catch (error) {
            await client.query("ROLLBACK");
            console.error(`[ContestLifecycle] Automatic settlement skipped for ${candidate.public_id}:`, error.message);
        } finally {
            client.release();
        }
    }
    return { settlements };
}

async function changeContestStatus({ adminUserId, publicId, status, reason, settlementNotes, outcomes }) {
    const nextStatus = String(status || "").toUpperCase();
    if (!CONTEST_STATUSES.has(nextStatus)) throw operationalError(400, "Invalid contest status");
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const contest = await client.query("SELECT id, status, lifecycle_mode FROM demo_dashboard_contests WHERE public_id=$1 FOR UPDATE", [publicId]);
        if (!contest.rowCount) throw operationalError(404, "Demo contest was not found");
        const current = contest.rows[0].status;
        if (contest.rows[0].lifecycle_mode === "SCHEDULED") {
            throw operationalError(409, "Scheduled contests are advanced and settled automatically");
        }
        if (!TRANSITIONS[current].has(nextStatus)) throw operationalError(409, `Cannot move contest from ${current} to ${nextStatus}`);
        if (nextStatus === "SETTLED") throw operationalError(400, "Use the settlement endpoint with a closingValue");
        if (nextStatus === "CANCELLED" && !String(reason || "").trim()) throw operationalError(400, "A cancellation reason is required");

        if (nextStatus === "CANCELLED") {
            const demoCurrency = await client.query('SELECT entry_atomic::text FROM demo_usdt_contests WHERE contest_id=$1', [contest.rows[0].id]);
            const entries = await client.query(
                `UPDATE demo_contest_entries SET status='CANCELLED', settled_at=NOW()
                 WHERE contest_id=$1 AND status='ACTIVE' RETURNING id,user_id,entry_credits`, [contest.rows[0].id]
            );
            for (const entry of entries.rows) {
                if (demoCurrency.rowCount) {
                    await refundDemoUsdtEntry(client, { userId: entry.user_id, contestId: contest.rows[0].id, entryId: entry.id, entryAtomic: demoCurrency.rows[0].entry_atomic });
                    await createNotification(client, { userId: entry.user_id, type: "CONTEST_CANCELLED", title: "Contest cancelled", message: "Your Demo USDT entry was refunded.", metadata: { publicId, entryId: entry.id } });
                    continue;
                }
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
        `SELECT entry.id, entry.status, entry.entry_credits, entry.prediction_value, entry.reward_credits, entry.joined_at, users.mobile,
                EXISTS (SELECT 1 FROM demo_usdt_contests d WHERE d.contest_id=contest.id) AS is_demo_usdt,
                (SELECT (a.amount_atomic::numeric / 1000000)::text FROM demo_usdt_activity a WHERE a.entry_id=entry.id AND a.activity_type='REWARD') AS demo_usdt_reward
         FROM demo_contest_entries entry
         JOIN demo_dashboard_contests contest ON contest.id=entry.contest_id
         JOIN users ON users.id=entry.user_id
         WHERE contest.public_id=$1 ORDER BY entry.joined_at DESC`, [publicId]
    );
    return result.rows.map((row) => ({ ...row, mobile: `${row.mobile.slice(0, 2)}******${row.mobile.slice(-2)}` }));
}

async function getContestDetails(publicId) {
    const contestResult = await pool.query(
        `SELECT contest.public_id, contest.title, contest.question, contest.status, contest.lifecycle_mode,
                EXISTS (SELECT 1 FROM demo_usdt_contests d WHERE d.contest_id=contest.id) AS is_demo_usdt,
                contest.entry_credits, contest.prize_pool_credits, contest.player_capacity,
                (SELECT COUNT(*)::INTEGER FROM demo_contest_entries entry WHERE entry.contest_id=contest.id) AS player_count,
                contest.created_at, contest.opens_at, contest.live_at, contest.closes_at, contest.settled_at,
                contest.settlement_value::TEXT AS settlement_value, contest.settlement_source, contest.settlement_notes,
                instrument.code AS instrument_code, instrument.display_name AS instrument_name,
                snapshot.value::TEXT AS market_value, snapshot.change_percent::TEXT AS market_change_percent,
                snapshot.observed_at AS market_observed_at, snapshot.provider_key AS market_provider
         FROM demo_dashboard_contests contest
         JOIN market_instruments instrument ON instrument.id=contest.instrument_id
         LEFT JOIN LATERAL (
            SELECT value, change_percent, observed_at, provider_key
            FROM market_price_snapshots
            WHERE instrument_id=contest.instrument_id
            ORDER BY observed_at DESC LIMIT 1
         ) snapshot ON TRUE
         WHERE contest.public_id=$1`,
        [publicId]
    );
    if (!contestResult.rowCount) throw operationalError(404, "Demo contest was not found");
    const timelineResult = await pool.query(
        `SELECT previous_status, next_status, trigger_source, occurred_at
         FROM demo_contest_lifecycle_events event
         JOIN demo_dashboard_contests contest ON contest.id=event.contest_id
         WHERE contest.public_id=$1 ORDER BY occurred_at ASC`,
        [publicId]
    );
    return { contest: contestResult.rows[0], timeline: timelineResult.rows, entries: await getContestEntries(publicId) };
}

module.exports = { autoSettleScheduledContests, calculateWinnerRewards, changeContestStatus, createContest, getContestDetails, getContestEntries, listContests, settleContest, updateContest };
