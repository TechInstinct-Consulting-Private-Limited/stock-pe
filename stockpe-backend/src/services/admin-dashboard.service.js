const pool = require("../config/database");
const { atomicToDemoUsdt } = require("./demo-usdt.service");

function integer(value) { return Number(value || 0); }

// This is intentionally an aggregation endpoint. The dashboard must not load
// every directory/table in the browser just to calculate a few headline values.
async function getOverview() {
    const [users, wallets, contests, notifications, market, activity] = await Promise.all([
        pool.query(`WITH latest_kyc AS (
            SELECT DISTINCT ON (user_id) user_id, status
            FROM aadhaar_kyc_verifications ORDER BY user_id, created_at DESC
        )
        SELECT COUNT(*)::int AS total,
               COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '24 hours')::int AS new_today,
               COUNT(*) FILTER (WHERE mobile_verified=TRUE)::int AS mobile_verified,
               COUNT(*) FILTER (WHERE UPPER(kyc.status)='VERIFIED')::int AS kyc_verified,
               COUNT(*) FILTER (WHERE UPPER(kyc.status) IN ('PENDING','INITIATED','REQUESTED'))::int AS kyc_pending,
               COUNT(*) FILTER (WHERE UPPER(kyc.status) IN ('FAILED','REJECTED'))::int AS kyc_failed
         FROM users LEFT JOIN latest_kyc kyc ON kyc.user_id=users.id`),
        pool.query(`SELECT COUNT(*)::int AS demo_accounts,
                           COALESCE(SUM(available_atomic),0)::text AS available_atomic,
                           COALESCE(SUM(reserved_atomic),0)::text AS reserved_atomic,
                           (SELECT COUNT(DISTINCT user_id)::int FROM usdt_wallets) AS linked_wallets
                    FROM demo_usdt_accounts`),
        pool.query(`SELECT COUNT(*)::int AS total,
                           COUNT(*) FILTER (WHERE status='SOON')::int AS soon,
                           COUNT(*) FILTER (WHERE status='OPEN')::int AS open,
                           COUNT(*) FILTER (WHERE status='LIVE')::int AS live,
                           COUNT(*) FILTER (WHERE status='CLOSED')::int AS closed,
                           COUNT(*) FILTER (WHERE status='SETTLED' AND settled_at >= NOW() - INTERVAL '24 hours')::int AS settled_today,
                           COALESCE(SUM(player_count),0)::int AS participants,
                           COALESCE(SUM(player_count) FILTER (WHERE status IN ('OPEN','LIVE')),0)::int AS active_participants,
                           COALESCE(SUM(prize_pool_credits) FILTER (WHERE status IN ('SOON','OPEN','LIVE')),0)::text AS scheduled_prize_pool
                    FROM demo_dashboard_contests`),
        pool.query(`SELECT COUNT(*)::int AS total,
                           COUNT(*) FILTER (WHERE read_at IS NULL)::int AS unread,
                           COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '24 hours')::int AS last_24_hours,
                           (SELECT COUNT(*)::int FROM notification_deliveries WHERE status='FAILED') AS failed_deliveries
                    FROM profile_notifications`),
        pool.query(`SELECT MAX(observed_at) AS last_snapshot_at,
                           COUNT(DISTINCT instrument_id)::int AS instrument_count,
                           COALESCE((ARRAY_AGG(provider_key ORDER BY observed_at DESC))[1], 'unavailable') AS provider
                    FROM market_price_snapshots`),
        pool.query(`SELECT * FROM (
                        SELECT created_at AS occurred_at, 'USER' AS category, 'New user registered' AS title, mobile AS detail
                        FROM users
                        UNION ALL
                        SELECT created_at, 'CONTEST', 'Contest created', title FROM demo_dashboard_contests
                        UNION ALL
                        SELECT event.occurred_at, 'CONTEST', event.previous_status || ' → ' || event.next_status,
                               contest.title FROM demo_contest_lifecycle_events event JOIN demo_dashboard_contests contest ON contest.id=event.contest_id
                        UNION ALL
                        SELECT created_at, 'WALLET', 'Demo USDT ' || INITCAP(LOWER(activity_type)), amount_atomic::text || ' atomic units'
                        FROM demo_usdt_activity
                        UNION ALL
                        SELECT created_at, 'NOTIFICATION', title, message FROM profile_notifications
                    ) activity ORDER BY occurred_at DESC LIMIT 15`),
    ]);

    const user = users.rows[0];
    const wallet = wallets.rows[0];
    const contest = contests.rows[0];
    const notification = notifications.rows[0];
    const feed = market.rows[0];

    const upcoming = await pool.query(`SELECT public_id, title, status, opens_at, live_at, closes_at, player_count, player_capacity,
                                               instrument.display_name AS instrument_name
                                        FROM demo_dashboard_contests contest
                                        JOIN market_instruments instrument ON instrument.id=contest.instrument_id
                                        WHERE status IN ('SOON','OPEN','LIVE','CLOSED')
                                        ORDER BY CASE status WHEN 'LIVE' THEN 1 WHEN 'OPEN' THEN 2 WHEN 'SOON' THEN 3 ELSE 4 END,
                                                 COALESCE(live_at, opens_at, closes_at) ASC
                                        LIMIT 8`);

    return {
        generatedAt: new Date().toISOString(),
        users: {
            total: integer(user.total), newToday: integer(user.new_today), mobileVerified: integer(user.mobile_verified),
            kycVerified: integer(user.kyc_verified), kycPending: integer(user.kyc_pending), kycFailed: integer(user.kyc_failed),
        },
        wallets: {
            linked: integer(wallet.linked_wallets), demoAccounts: integer(wallet.demo_accounts),
            demoAvailable: atomicToDemoUsdt(wallet.available_atomic), demoReserved: atomicToDemoUsdt(wallet.reserved_atomic),
            currency: "DEMO_USDT",
        },
        contests: {
            total: integer(contest.total), soon: integer(contest.soon), open: integer(contest.open), live: integer(contest.live),
            closed: integer(contest.closed), settledToday: integer(contest.settled_today), participants: integer(contest.participants),
            activeParticipants: integer(contest.active_participants), scheduledPrizePool: String(contest.scheduled_prize_pool || "0"),
        },
        notifications: {
            total: integer(notification.total), unread: integer(notification.unread), last24Hours: integer(notification.last_24_hours),
            failedDeliveries: integer(notification.failed_deliveries),
        },
        market: { provider: feed.provider, instrumentCount: integer(feed.instrument_count), lastSnapshotAt: feed.last_snapshot_at },
        upcomingContests: upcoming.rows,
        recentActivity: activity.rows,
    };
}

module.exports = { getOverview };
