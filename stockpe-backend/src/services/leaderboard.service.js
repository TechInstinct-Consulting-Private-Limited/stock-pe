const pool = require("../config/database");

function publicName(fullName, mobile) {
    const words = String(fullName || "").trim().split(/\s+/).filter(Boolean);
    if (words.length) return words.map((word) => `${word.slice(0, 1).toUpperCase()}${"•".repeat(Math.max(1, word.length - 1))}`).join(" ");
    return `Player •••${String(mobile || "").slice(-2)}`;
}

function normalizeInstrument(value) {
    const instrument = String(value || "ALL").trim().toUpperCase();
    return instrument.slice(0, 40) || "ALL";
}

function operationalError(statusCode, message) {
    const error = new Error(message); error.statusCode = statusCode; error.isOperational = true; return error;
}

async function findLeaderboardContest(instrumentCode) {
    const values = instrumentCode === "ALL" ? [] : [instrumentCode];
    const filter = instrumentCode === "ALL" ? "" : "AND instrument.code=$1";
    const result = await pool.query(
        `SELECT contest.id, contest.public_id, contest.title, contest.status, contest.player_capacity,
                contest.settlement_value::text, instrument.code AS instrument_code, instrument.display_name AS instrument_name,
                COALESCE(demo.prize_pool_atomic::numeric / 1000000, contest.prize_pool_credits)::text AS prize_pool,
                CASE WHEN demo.contest_id IS NULL THEN 'DEMO_CREDITS' ELSE 'DEMO_USDT' END AS currency,
                CASE WHEN contest.status='SETTLED' THEN contest.settlement_value ELSE snapshot.value END::text AS reference_value,
                snapshot.observed_at AS reference_observed_at
         FROM demo_dashboard_contests contest
         JOIN market_instruments instrument ON instrument.id=contest.instrument_id
         LEFT JOIN demo_usdt_contests demo ON demo.contest_id=contest.id
         LEFT JOIN LATERAL (
           SELECT value, observed_at FROM market_price_snapshots
           WHERE instrument_id=contest.instrument_id ORDER BY observed_at DESC LIMIT 1
         ) snapshot ON TRUE
         WHERE contest.status IN ('OPEN','LIVE','SETTLED') ${filter}
         ORDER BY CASE contest.status WHEN 'LIVE' THEN 1 WHEN 'OPEN' THEN 2 WHEN 'SETTLED' THEN 3 ELSE 4 END,
                  contest.closes_at DESC
         LIMIT 1`, values
    );
    return result.rows[0] || null;
}

async function listLeaderboard({ instrument, currentUserId }) {
    const requestedInstrument = normalizeInstrument(instrument);
    const filters = await pool.query(
        `SELECT DISTINCT instrument.code, instrument.display_name
         FROM demo_dashboard_contests contest JOIN market_instruments instrument ON instrument.id=contest.instrument_id
         WHERE contest.status IN ('OPEN','LIVE','SETTLED') ORDER BY instrument.display_name ASC`
    );
    const contest = await findLeaderboardContest(requestedInstrument);
    if (!contest) return { filters: filters.rows, selectedInstrument: requestedInstrument, contest: null, entries: [] };
    const reference = Number(contest.reference_value);
    const usableReference = Number.isFinite(reference) && reference > 0 ? reference : null;
    const entries = await pool.query(
        `SELECT entry.id, entry.user_id, entry.prediction_value::text, entry.status, entry.joined_at, entry.reward_credits,
                member.mobile, kyc.full_name,
                COALESCE((SELECT amount_atomic::numeric / 1000000 FROM demo_usdt_activity activity
                    WHERE activity.entry_id=entry.id AND activity.activity_type='REWARD' ORDER BY activity.created_at DESC LIMIT 1), 0)::text AS reward_amount
         FROM demo_contest_entries entry
         JOIN users member ON member.id=entry.user_id
         LEFT JOIN LATERAL (
           SELECT full_name FROM aadhaar_kyc_verifications WHERE user_id=member.id AND status='verified' ORDER BY created_at DESC LIMIT 1
         ) kyc ON TRUE
         WHERE entry.contest_id=$1 AND entry.prediction_value IS NOT NULL
         ORDER BY entry.joined_at ASC`, [contest.id]
    );
    const ranked = entries.rows.map((row) => {
        const prediction = Number(row.prediction_value);
        const distance = usableReference !== null && Number.isFinite(prediction) ? Math.abs(prediction - usableReference) : null;
        return { id: row.id, userId: row.user_id, name: publicName(row.full_name, row.mobile), prediction: row.prediction_value, status: row.status, joinedAt: row.joined_at, rewardAmount: contest.currency === 'DEMO_USDT' ? row.reward_amount : String(row.reward_credits || 0), currency: contest.currency, distance, isCurrentUser: row.user_id === currentUserId };
    }).sort((a, b) => (a.distance ?? Number.POSITIVE_INFINITY) - (b.distance ?? Number.POSITIVE_INFINITY) || new Date(a.joinedAt) - new Date(b.joinedAt));
    let rank = 0; let previousDistance = null;
    ranked.forEach((row, index) => { if (row.distance !== previousDistance) rank = index + 1; row.rank = rank; previousDistance = row.distance; row.accuracy = row.distance === null || usableReference === null ? null : Math.max(0, 100 - (row.distance / usableReference) * 100); });
    return {
        filters: filters.rows,
        selectedInstrument: contest.instrument_code,
        contest: { publicId: contest.public_id, title: contest.title, status: contest.status, instrumentCode: contest.instrument_code, instrumentName: contest.instrument_name, playerCapacity: contest.player_capacity, playerCount: ranked.length, prizePool: contest.prize_pool, currency: contest.currency, referenceValue: contest.reference_value, referenceObservedAt: contest.reference_observed_at, rankingMode: contest.status === 'SETTLED' ? 'FINAL' : 'PROVISIONAL' },
        entries: ranked,
    };
}

async function getLeaderProfile({ userId, currentUserId }) {
    const user = await pool.query(
        `SELECT u.id, u.mobile, u.created_at, kyc.full_name FROM users u
         LEFT JOIN LATERAL (SELECT full_name FROM aadhaar_kyc_verifications WHERE user_id=u.id AND status='verified' ORDER BY created_at DESC LIMIT 1) kyc ON TRUE
         WHERE u.id=$1`, [userId]
    );
    if (!user.rowCount) throw operationalError(404, "Leaderboard player was not found");
    const stats = await pool.query(
        `SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE status='WON')::int AS won,
                COUNT(*) FILTER (WHERE status='LOST')::int AS lost,
                COUNT(*) FILTER (WHERE status='ACTIVE')::int AS active,
                COALESCE((SELECT SUM(amount_atomic)::numeric / 1000000 FROM demo_usdt_activity WHERE user_id=$1 AND activity_type='REWARD'), 0)::text AS rewards
         FROM demo_contest_entries WHERE user_id=$1`, [userId]
    );
    const recent = await pool.query(
        `SELECT entry.id, entry.status, entry.prediction_value::text, entry.joined_at, entry.settled_at, entry.reward_credits,
                contest.title, instrument.code AS instrument_code, CASE WHEN demo.contest_id IS NULL THEN 'DEMO_CREDITS' ELSE 'DEMO_USDT' END AS currency,
                COALESCE((SELECT amount_atomic::numeric / 1000000 FROM demo_usdt_activity activity WHERE activity.entry_id=entry.id AND activity.activity_type='REWARD' ORDER BY activity.created_at DESC LIMIT 1), 0)::text AS reward_amount
         FROM demo_contest_entries entry JOIN demo_dashboard_contests contest ON contest.id=entry.contest_id
         JOIN market_instruments instrument ON instrument.id=contest.instrument_id
         LEFT JOIN demo_usdt_contests demo ON demo.contest_id=contest.id
         WHERE entry.user_id=$1 ORDER BY entry.joined_at DESC LIMIT 20`, [userId]
    );
    const row = user.rows[0]; const performance = stats.rows[0];
    return { player: { id: row.id, name: publicName(row.full_name, row.mobile), joinedAt: row.created_at, isCurrentUser: row.id === currentUserId, contestsPlayed: performance.total, contestsWon: performance.won, contestsLost: performance.lost, activeContests: performance.active, rewards: performance.rewards, winRate: Number(performance.total) ? Number(((Number(performance.won) / Number(performance.total)) * 100).toFixed(1)) : 0 }, recent: recent.rows.map((entry) => ({ ...entry, reward_amount: entry.currency === 'DEMO_USDT' ? entry.reward_amount : String(entry.reward_credits || 0) })) };
}

module.exports = { getLeaderProfile, listLeaderboard };
