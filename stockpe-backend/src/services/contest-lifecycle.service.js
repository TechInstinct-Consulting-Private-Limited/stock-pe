const pool = require("../config/database");
const { syncDashboardMarketPrices } = require("./market-snapshot.service");
const { autoSettleScheduledContests } = require("./admin-contest.service");

const SCHEDULED_TRANSITIONS = [
    { previousStatus: "SOON", nextStatus: "OPEN", dueColumn: "opens_at" },
    { previousStatus: "OPEN", nextStatus: "LIVE", dueColumn: "live_at" },
    { previousStatus: "LIVE", nextStatus: "CLOSED", dueColumn: "closes_at" },
];

let runInFlight = null;

function getScheduledTransitions() {
    return SCHEDULED_TRANSITIONS.map((transition) => ({ ...transition }));
}

async function runScheduledContestLifecycle() {
    if (runInFlight) return runInFlight;

    runInFlight = (async () => {
        const automaticSettlementEnabled = process.env.DEMO_AUTO_SETTLEMENT_ENABLED !== "false";
        if (automaticSettlementEnabled) {
            await syncDashboardMarketPrices();
        }
        const client = await pool.connect();
        let transitions = [];
        try {
            await client.query("BEGIN");

            // Ordered transitions let a delayed worker catch up safely.
            for (const transition of SCHEDULED_TRANSITIONS) {
                const result = await client.query(
                    `UPDATE demo_dashboard_contests
                     SET status = $2, updated_at = NOW()
                     WHERE lifecycle_mode = 'SCHEDULED'
                       AND status = $1
                       AND ${transition.dueColumn} <= NOW()
                     RETURNING id, public_id`,
                    [transition.previousStatus, transition.nextStatus]
                );

                for (const contest of result.rows) {
                    await client.query(
                        `INSERT INTO demo_contest_lifecycle_events
                         (contest_id, previous_status, next_status, trigger_source)
                         VALUES ($1, $2, $3, 'SCHEDULER')`,
                        [contest.id, transition.previousStatus, transition.nextStatus]
                    );
                    transitions.push({
                        publicId: contest.public_id,
                        previousStatus: transition.previousStatus,
                        status: transition.nextStatus,
                    });
                }
            }

            await client.query("COMMIT");
        } catch (error) {
            await client.query("ROLLBACK");
            throw error;
        } finally {
            client.release();
        }

        if (!automaticSettlementEnabled) return { transitions, settlements: [] };
        const { settlements } = await autoSettleScheduledContests();
        return { transitions, settlements };
    })();

    try {
        return await runInFlight;
    } finally {
        runInFlight = null;
    }
}

function startContestLifecycleScheduler({ intervalMs = 60_000, logger = console } = {}) {
    const safeIntervalMs = Math.max(15_000, Number(intervalMs) || 60_000);
    const tick = () => runScheduledContestLifecycle()
        .then(({ transitions, settlements }) => {
            if (transitions.length) logger.info(`[ContestLifecycle] Advanced ${transitions.length} contest(s)`);
            if (settlements.length) logger.info(`[ContestLifecycle] Automatically settled ${settlements.length} demo contest(s)`);
        })
        .catch((error) => logger.error("[ContestLifecycle] Run skipped:", error.message));

    void tick();
    const timer = setInterval(tick, safeIntervalMs);
    timer.unref?.();
    return () => clearInterval(timer);
}

module.exports = { getScheduledTransitions, runScheduledContestLifecycle, startContestLifecycleScheduler };
