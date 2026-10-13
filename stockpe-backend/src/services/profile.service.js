const pool = require("../config/database");

function toNumber(value) { return Number(value || 0); }

async function getMe(userId) {
    const result = await pool.query(
        `SELECT u.mobile, u.mobile_verified, u.created_at,
                k.full_name AS verified_name,
                (k.id IS NOT NULL) AS kyc_verified,
                EXISTS(SELECT 1 FROM usdt_wallets w WHERE w.user_id=u.id) AS wallet_linked,
                COUNT(e.id)::int AS total_contests,
                COUNT(e.id) FILTER (WHERE e.status='ACTIVE')::int AS active_contests,
                COUNT(e.id) FILTER (WHERE e.status='WON')::int AS won_contests,
                COUNT(e.id) FILTER (WHERE e.status='LOST')::int AS lost_contests,
                COALESCE(SUM(e.reward_credits) FILTER (WHERE e.status='WON'), 0)::int AS total_reward_credits
         FROM users u
         LEFT JOIN LATERAL (
            SELECT id, full_name FROM aadhaar_kyc_verifications
            WHERE user_id=u.id AND status='verified'
            ORDER BY verified_at DESC LIMIT 1
         ) k ON TRUE
         LEFT JOIN demo_contest_entries e ON e.user_id=u.id
         WHERE u.id=$1
         GROUP BY u.id, k.id, k.full_name`, [userId],
    );
    const row = result.rows[0];
    if (!row) throw Object.assign(new Error("User was not found"), { statusCode: 404, isOperational: true });
    const settled = toNumber(row.won_contests) + toNumber(row.lost_contests);
    return {
        user: { displayName: row.verified_name || null, mobile: row.mobile, joinedAt: row.created_at, mobileVerified: row.mobile_verified, kycVerified: row.kyc_verified, walletLinked: row.wallet_linked },
        stats: { totalContests: toNumber(row.total_contests), activeContests: toNumber(row.active_contests), wonContests: toNumber(row.won_contests), lostContests: toNumber(row.lost_contests), winRate: settled ? Math.round((toNumber(row.won_contests) / settled) * 100) : 0, totalRewardCredits: toNumber(row.total_reward_credits) },
    };
}

async function getPredictions(userId, status = "ALL") {
    const requested = String(status || "ALL").toUpperCase();
    if (!["ALL", "ACTIVE", "SETTLED"].includes(requested)) throw Object.assign(new Error("Invalid prediction status"), { statusCode: 400, isOperational: true });
    const values = [userId];
    const clause = requested === "ALL" ? "" : requested === "ACTIVE" ? "AND entry.status='ACTIVE'" : "AND entry.status IN ('WON','LOST','CANCELLED')";
    const result = await pool.query(
        `SELECT entry.id, entry.status, entry.entry_credits, entry.prediction_value, entry.reward_credits, entry.joined_at, entry.settled_at,
                contest.public_id, contest.title, contest.settlement_value
         FROM demo_contest_entries entry JOIN demo_dashboard_contests contest ON contest.id=entry.contest_id
         WHERE entry.user_id=$1 ${clause} ORDER BY entry.joined_at DESC`, values,
    );
    return result.rows;
}

async function getWinnings(userId) {
    const entries = await getPredictions(userId, "SETTLED");
    const wins = entries.filter((entry) => entry.status === "WON");
    return { totalRewardCredits: wins.reduce((sum, entry) => sum + toNumber(entry.reward_credits), 0), winCount: wins.length, rewards: wins };
}

async function listNotifications(userId) {
    const result = await pool.query(`SELECT id, type, title, message, metadata, read_at, created_at FROM profile_notifications WHERE user_id=$1 ORDER BY created_at DESC LIMIT 100`, [userId]);
    return result.rows;
}

async function markNotificationRead(userId, notificationId) {
    const result = await pool.query(`UPDATE profile_notifications SET read_at=COALESCE(read_at, NOW()) WHERE id=$1 AND user_id=$2 RETURNING id`, [notificationId, userId]);
    if (!result.rowCount) throw Object.assign(new Error("Notification was not found"), { statusCode: 404, isOperational: true });
}

async function markAllNotificationsRead(userId) { await pool.query("UPDATE profile_notifications SET read_at=NOW() WHERE user_id=$1 AND read_at IS NULL", [userId]); }

module.exports = { getMe, getPredictions, getWinnings, listNotifications, markNotificationRead, markAllNotificationsRead };
