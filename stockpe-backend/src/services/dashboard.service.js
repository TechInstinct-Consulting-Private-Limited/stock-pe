const pool = require("../config/database");
const { syncDashboardMarketPrices } = require("./market-snapshot.service");

const DASHBOARD_FILTERS = new Set(["ALL", "LIVE", "OPEN", "SOON"]);

function normalizeDashboardFilter(value) {
    const normalized = String(value || "ALL").trim().toUpperCase();
    return DASHBOARD_FILTERS.has(normalized) ? normalized : null;
}

function serializeContest(row) {
    const playerCount = Number(row.player_count);
    const playerCapacity = Number(row.player_capacity);

    return {
        id: row.public_id,
        title: row.title,
        question: row.question,
        status: row.status,
        currentPrice: Number(row.current_price),
        changePercent: Number(row.change_percent),
        isPositive: Number(row.change_percent) >= 0,
        entryCredits: Number(row.entry_credits),
        prizePoolCredits: Number(row.prize_pool_credits),
        players: playerCount,
        playerCapacity,
        fillPercent: Math.round((playerCount / playerCapacity) * 100),
        opensAt: row.opens_at,
        secondsUntilOpen: Math.max(0, Number(row.seconds_until_open) || 0),
        closesAt: row.closes_at,
        secondsUntilClose: Math.max(0, Number(row.seconds_until_close)),
        settlementSource: row.settlement_source,
        isDemo: true,
    };
}

async function getContestByPublicId(publicId) {
    await syncDashboardMarketPrices();
    const result = await pool.query(
        `SELECT contest.public_id, contest.title, contest.question, contest.status,
                contest.entry_credits, contest.prize_pool_credits, contest.player_capacity,
                contest.player_count, contest.opens_at, contest.closes_at, contest.settlement_source,
                instrument.code AS instrument_code, instrument.display_name AS instrument_name,
                instrument.exchange, instrument.category,
                quote.value::TEXT AS current_price, quote.change_percent::TEXT AS change_percent,
                GREATEST(0, FLOOR(EXTRACT(EPOCH FROM (contest.closes_at - NOW()))))::INTEGER
                    AS seconds_until_close
         FROM demo_dashboard_contests contest
         JOIN market_instruments instrument ON instrument.id = contest.instrument_id
         JOIN LATERAL (
             SELECT value, change_percent
             FROM market_price_snapshots
             WHERE instrument_id = contest.instrument_id
             ORDER BY observed_at DESC
             LIMIT 1
         ) quote ON TRUE
         WHERE contest.public_id = $1
           AND contest.status IN ('SOON', 'OPEN', 'LIVE')`,
        [publicId]
    );

    if (!result.rows[0]) {
        const error = new Error("Demo contest was not found");
        error.statusCode = 404;
        error.isOperational = true;
        throw error;
    }

    const contest = serializeContest(result.rows[0]);
    return {
        ...contest,
        opensAt: result.rows[0].opens_at,
        instrument: {
            code: result.rows[0].instrument_code,
            name: result.rows[0].instrument_name,
            exchange: result.rows[0].exchange,
            category: result.rows[0].category,
        },
    };
}

async function getDashboard({ filter }) {
    const status = normalizeDashboardFilter(filter);
    if (!status) {
        const error = new Error("status must be one of ALL, LIVE, OPEN, or SOON");
        error.statusCode = 400;
        error.isOperational = true;
        throw error;
    }

    await syncDashboardMarketPrices();

    const whereClause = status === "ALL"
        ? "WHERE contest.status IN ('SOON', 'OPEN', 'LIVE')"
        : "WHERE contest.status = $1";
    const parameters = status === "ALL" ? [] : [status];

    const [metricsResult, contestsResult, countsResult, tickerResult] = await Promise.all([
        pool.query(
            `SELECT prize_pool_credits, live_players, paid_out_credits, updated_at
             FROM demo_dashboard_metrics WHERE singleton = TRUE`
        ),
        pool.query(
            `SELECT contest.public_id, contest.title, contest.question, contest.status,
                    contest.entry_credits, contest.prize_pool_credits, contest.player_capacity,
                    contest.player_count, contest.opens_at, contest.closes_at, contest.settlement_source,
                    quote.value::TEXT AS current_price, quote.change_percent::TEXT AS change_percent,
                    GREATEST(0, FLOOR(EXTRACT(EPOCH FROM (contest.opens_at - NOW()))))::INTEGER
                        AS seconds_until_open,
                    GREATEST(0, FLOOR(EXTRACT(EPOCH FROM (contest.closes_at - NOW()))))::INTEGER
                        AS seconds_until_close
             FROM demo_dashboard_contests contest
             JOIN LATERAL (
                 SELECT value, change_percent
                 FROM market_price_snapshots
                 WHERE instrument_id = contest.instrument_id
                 ORDER BY observed_at DESC
                 LIMIT 1
             ) quote ON TRUE
             ${whereClause}
             ORDER BY contest.display_order ASC, contest.closes_at ASC`,
            parameters
        ),
        pool.query(
            `SELECT status, COUNT(*)::INTEGER AS count
             FROM demo_dashboard_contests
             WHERE status IN ('SOON', 'OPEN', 'LIVE')
             GROUP BY status`
        ),
        pool.query(
            `SELECT instrument.code, instrument.display_name,
                    snapshot.value::TEXT AS value, snapshot.change_percent::TEXT AS change_percent,
                    snapshot.observed_at
             FROM market_instruments instrument
             JOIN LATERAL (
                 SELECT value, change_percent, observed_at
                 FROM market_price_snapshots
                 WHERE instrument_id = instrument.id
                 ORDER BY observed_at DESC
                 LIMIT 1
             ) snapshot ON TRUE
             WHERE instrument.is_active = TRUE
             ORDER BY instrument.code ASC`
        ),
    ]);

    const metrics = metricsResult.rows[0];
    if (!metrics) {
        throw new Error("Dashboard demo metrics have not been configured");
    }

    const counts = { ALL: 0, LIVE: 0, OPEN: 0, SOON: 0 };
    for (const row of countsResult.rows) {
        counts[row.status] = row.count;
        counts.ALL += row.count;
    }

    return {
        environment: "demo",
        serverTime: new Date().toISOString(),
        filter: status,
        filters: counts,
        disclaimer: "Demo credits have no cash value. Entries, payouts, deposits, and withdrawals are disabled.",
        summary: {
            prizePoolCredits: Number(metrics.prize_pool_credits),
            livePlayers: Number(metrics.live_players),
            paidOutCredits: Number(metrics.paid_out_credits),
            updatedAt: metrics.updated_at,
        },
        ticker: tickerResult.rows.map((row) => ({
            code: row.code,
            label: row.display_name,
            value: Number(row.value),
            changePercent: Number(row.change_percent),
            observedAt: row.observed_at,
        })),
        contests: contestsResult.rows.map(serializeContest),
    };
}

module.exports = { getDashboard, getContestByPublicId, normalizeDashboardFilter };
