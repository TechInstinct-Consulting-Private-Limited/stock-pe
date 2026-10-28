const pool = require("../config/database");
const { atomicToDemoUsdt } = require("./demo-usdt.service");

function normalizeQuery(value) {
    return String(value || "").trim().slice(0, 80);
}

async function listUsers({ query } = {}) {
    const search = normalizeQuery(query);
    const values = [];
    const where = search
        ? `WHERE u.mobile ILIKE $1 OR COALESCE(kyc.full_name, '') ILIKE $1 OR COALESCE(wallet.address, '') ILIKE $1`
        : "";

    if (search) values.push(`%${search}%`);

    const result = await pool.query(
        `SELECT u.id, u.mobile, u.mobile_verified, u.created_at,
                kyc.full_name, kyc.status AS kyc_status, kyc.verified_at,
                wallet.network AS wallet_network, wallet.address AS wallet_address,
                admin.role AS admin_role,
                demo.available_atomic::text AS demo_available_atomic,
                demo.reserved_atomic::text AS demo_reserved_atomic
         FROM users u
         LEFT JOIN LATERAL (
            SELECT full_name, status, verified_at
            FROM aadhaar_kyc_verifications
            WHERE user_id=u.id
            ORDER BY created_at DESC
            LIMIT 1
         ) kyc ON TRUE
         LEFT JOIN LATERAL (
            SELECT network, address
            FROM usdt_wallets
            WHERE user_id=u.id
            ORDER BY created_at DESC
            LIMIT 1
         ) wallet ON TRUE
         LEFT JOIN admin_accounts admin ON admin.user_id=u.id
         LEFT JOIN demo_usdt_accounts demo ON demo.user_id=u.id
         ${where}
         ORDER BY u.created_at DESC
         LIMIT 200`,
        values,
    );

    return result.rows.map((row) => ({
        id: row.id,
        mobile: row.mobile,
        mobileVerified: row.mobile_verified,
        displayName: row.full_name || null,
        kycStatus: row.kyc_status || "not_started",
        kycVerifiedAt: row.verified_at || null,
        wallet: row.wallet_address ? { network: row.wallet_network, address: row.wallet_address } : null,
        demoUsdt: row.demo_available_atomic === null ? null : {
            available: atomicToDemoUsdt(row.demo_available_atomic),
            reserved: atomicToDemoUsdt(row.demo_reserved_atomic),
        },
        adminRole: row.admin_role || null,
        joinedAt: row.created_at,
    }));
}

async function listWalletDirectory({ query } = {}) {
    const search = normalizeQuery(query);
    const values = [];
    const where = search
        ? `WHERE u.mobile ILIKE $1 OR COALESCE(kyc.full_name, '') ILIKE $1 OR wallet.address ILIKE $1`
        : "";
    if (search) values.push(`%${search}%`);
    const result = await pool.query(
        `SELECT wallet.id, wallet.network, wallet.address, wallet.created_at AS linked_at,
                u.id AS user_id, u.mobile, kyc.full_name, kyc.status AS kyc_status,
                COALESCE((SELECT SUM(CASE entry.direction WHEN 'CREDIT' THEN entry.amount_usdt WHEN 'DEBIT' THEN -entry.amount_usdt ELSE 0 END)
                    FROM wallet_ledger_entries entry
                    JOIN wallet_ledger_accounts account ON account.id=entry.ledger_account_id
                    JOIN wallet_ledger_transactions transaction ON transaction.id=entry.ledger_transaction_id
                    WHERE account.user_id=u.id AND account.account_type='USER_AVAILABLE' AND transaction.status='POSTED'), 0)::text AS provider_available_usdt,
                demo.available_atomic::text AS demo_available_atomic, demo.reserved_atomic::text AS demo_reserved_atomic
         FROM usdt_wallets wallet
         JOIN users u ON u.id=wallet.user_id
         LEFT JOIN LATERAL (
           SELECT full_name, status FROM aadhaar_kyc_verifications WHERE user_id=u.id ORDER BY created_at DESC LIMIT 1
         ) kyc ON TRUE
         LEFT JOIN demo_usdt_accounts demo ON demo.user_id=u.id
         ${where}
         ORDER BY wallet.created_at DESC
         LIMIT 200`, values
    );
    return result.rows.map((row) => ({
        id: row.id, userId: row.user_id, mobile: row.mobile, displayName: row.full_name || null,
        kycStatus: row.kyc_status || "not_started", network: row.network, address: row.address, linkedAt: row.linked_at,
        providerAvailableUsdt: row.provider_available_usdt,
        demoUsdt: row.demo_available_atomic === null ? null : { available: atomicToDemoUsdt(row.demo_available_atomic), reserved: atomicToDemoUsdt(row.demo_reserved_atomic) },
    }));
}

async function requireUser(userId) {
    const result = await pool.query(
        `SELECT u.id, u.mobile, u.mobile_verified, u.created_at,
                kyc.full_name, kyc.status AS kyc_status, kyc.verified_at, kyc.provider,
                kyc.aadhaar_last_four, wallet.network AS wallet_network, wallet.address AS wallet_address,
                wallet.created_at AS wallet_linked_at, admin.role AS admin_role,
                demo.available_atomic::text AS demo_available_atomic, demo.reserved_atomic::text AS demo_reserved_atomic
         FROM users u
         LEFT JOIN LATERAL (
            SELECT full_name, status, verified_at, provider, aadhaar_last_four
            FROM aadhaar_kyc_verifications WHERE user_id=u.id ORDER BY created_at DESC LIMIT 1
         ) kyc ON TRUE
         LEFT JOIN LATERAL (
            SELECT network, address, created_at FROM usdt_wallets WHERE user_id=u.id ORDER BY created_at DESC LIMIT 1
         ) wallet ON TRUE
         LEFT JOIN admin_accounts admin ON admin.user_id=u.id
         LEFT JOIN demo_usdt_accounts demo ON demo.user_id=u.id
         WHERE u.id=$1`, [userId]
    );
    if (!result.rowCount) {
        const error = new Error("User was not found"); error.statusCode = 404; error.isOperational = true; throw error;
    }
    return result.rows[0];
}

function mapUser(row) {
    return {
        id: row.id, mobile: row.mobile, mobileVerified: row.mobile_verified,
        displayName: row.full_name || null, joinedAt: row.created_at,
        adminRole: row.admin_role || null,
        kyc: { status: row.kyc_status || "not_started", verifiedAt: row.verified_at || null, provider: row.provider || null, aadhaarLastFour: row.aadhaar_last_four || null },
        wallet: row.wallet_address ? { network: row.wallet_network, address: row.wallet_address, linkedAt: row.wallet_linked_at } : null,
        demoUsdt: row.demo_available_atomic === null ? null : { available: atomicToDemoUsdt(row.demo_available_atomic), reserved: atomicToDemoUsdt(row.demo_reserved_atomic) },
    };
}

async function getUserOverview(userId) {
    const user = mapUser(await requireUser(userId));
    const contest = await pool.query(
        `SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE status='ACTIVE')::int AS active,
                COUNT(*) FILTER (WHERE status='WON')::int AS won, COUNT(*) FILTER (WHERE status='LOST')::int AS lost,
                COUNT(*) FILTER (WHERE status='CANCELLED')::int AS cancelled,
                COUNT(*) FILTER (WHERE status='WON' AND (
                  SELECT COUNT(*) FROM demo_contest_entries same_contest
                  WHERE same_contest.contest_id=entry.contest_id AND same_contest.status='WON'
                ) > 1)::int AS tie_wins
         FROM demo_contest_entries entry WHERE entry.user_id=$1`, [userId]
    );
    const reward = await pool.query(`SELECT COALESCE(SUM(amount_atomic) FILTER (WHERE activity_type='REWARD'), 0)::text AS reward_atomic FROM demo_usdt_activity WHERE user_id=$1`, [userId]);
    const latest = await pool.query(
        `SELECT contest.title, entry.status, entry.settled_at, entry.prediction_value, contest.public_id
         FROM demo_contest_entries entry JOIN demo_dashboard_contests contest ON contest.id=entry.contest_id
         WHERE entry.user_id=$1 AND entry.status IN ('WON','LOST') ORDER BY entry.settled_at DESC LIMIT 1`, [userId]
    );
    return { user, contestStats: contest.rows[0], demoRewardTotal: atomicToDemoUsdt(reward.rows[0].reward_atomic), latestResult: latest.rows[0] || null };
}

async function getUserWallet(userId) {
    const user = mapUser(await requireUser(userId));
    const activities = await pool.query(
        `SELECT activity.id, activity.activity_type, activity.amount_atomic::text, activity.created_at,
                contest.public_id, contest.title, entry.status AS entry_status
         FROM demo_usdt_activity activity
         LEFT JOIN demo_dashboard_contests contest ON contest.id=activity.contest_id
         LEFT JOIN demo_contest_entries entry ON entry.id=activity.entry_id
         WHERE activity.user_id=$1 ORDER BY activity.created_at DESC, activity.id DESC LIMIT 100`, [userId]
    );
    const ledger = await pool.query(
        `SELECT transaction.reference_type, transaction.reference_id, transaction.status,
                entry.direction, entry.amount_usdt::text, entry.created_at
         FROM wallet_ledger_entries entry
         JOIN wallet_ledger_accounts account ON account.id=entry.ledger_account_id
         JOIN wallet_ledger_transactions transaction ON transaction.id=entry.ledger_transaction_id
         WHERE account.user_id=$1 ORDER BY entry.created_at DESC LIMIT 100`, [userId]
    );
    return { wallet: user.wallet, demoUsdt: user.demoUsdt, activity: activities.rows.map((row) => ({ ...row, amount: atomicToDemoUsdt(row.amount_atomic), direction: row.activity_type === "ENTRY" ? "DEBIT" : "CREDIT" })), providerLedger: ledger.rows };
}

async function getUserContests(userId) {
    await requireUser(userId);
    const result = await pool.query(
        `SELECT entry.id, entry.status, entry.prediction_value, entry.entry_credits, entry.reward_credits,
                entry.joined_at, entry.settled_at, contest.public_id, contest.title, contest.settlement_value,
                instrument.code AS instrument_code, instrument.display_name AS instrument_name,
                demo.entry_atomic::text AS entry_atomic, reward.amount_atomic::text AS reward_atomic,
                (SELECT COUNT(*) FROM demo_contest_entries same_contest WHERE same_contest.contest_id=entry.contest_id AND same_contest.status='WON')::int AS winner_count
         FROM demo_contest_entries entry
         JOIN demo_dashboard_contests contest ON contest.id=entry.contest_id
         JOIN market_instruments instrument ON instrument.id=contest.instrument_id
         LEFT JOIN demo_usdt_contests demo ON demo.contest_id=contest.id
         LEFT JOIN LATERAL (SELECT amount_atomic FROM demo_usdt_activity WHERE entry_id=entry.id AND activity_type='REWARD' ORDER BY created_at DESC LIMIT 1) reward ON TRUE
         WHERE entry.user_id=$1 ORDER BY entry.joined_at DESC LIMIT 200`, [userId]
    );
    return result.rows.map((row) => ({ ...row, entryAmount: row.entry_atomic ? atomicToDemoUsdt(row.entry_atomic) : null, rewardAmount: row.reward_atomic ? atomicToDemoUsdt(row.reward_atomic) : "0.000000", tieWin: row.status === "WON" && row.winner_count > 1 }));
}

async function getUserKyc(userId) {
    await requireUser(userId);
    return (await pool.query(`SELECT status, provider, aadhaar_last_four, consent_given_at, verified_at, expires_at, created_at, updated_at FROM aadhaar_kyc_verifications WHERE user_id=$1 ORDER BY created_at DESC LIMIT 50`, [userId])).rows;
}

async function getUserNotifications(userId) {
    await requireUser(userId);
    return (await pool.query(
        `SELECT notification.id, notification.type, notification.title, notification.message, notification.priority,
                notification.read_at, notification.created_at, notification.deep_link,
                COUNT(delivery.id)::int AS delivery_count,
                COUNT(delivery.id) FILTER (WHERE delivery.status='SENT')::int AS sent_count,
                COUNT(delivery.id) FILTER (WHERE delivery.status='FAILED')::int AS failed_count
         FROM profile_notifications notification LEFT JOIN notification_deliveries delivery ON delivery.notification_id=notification.id
         WHERE notification.user_id=$1 GROUP BY notification.id ORDER BY notification.created_at DESC LIMIT 100`, [userId]
    )).rows;
}

async function getUserActivity(userId) {
    await requireUser(userId);
    return (await pool.query(
        `SELECT * FROM (
            SELECT u.created_at AS occurred_at, 'ACCOUNT' AS category, 'Account registered' AS title, 'Mobile account created' AS detail FROM users u WHERE u.id=$1
            UNION ALL SELECT kyc.created_at, 'KYC', 'Aadhaar KYC ' || UPPER(kyc.status), 'Provider: ' || kyc.provider FROM aadhaar_kyc_verifications kyc WHERE kyc.user_id=$1
            UNION ALL SELECT activity.created_at, 'WALLET', 'Demo USDT ' || INITCAP(LOWER(activity.activity_type)), COALESCE(contest.title, 'Demo wallet activity') FROM demo_usdt_activity activity LEFT JOIN demo_dashboard_contests contest ON contest.id=activity.contest_id WHERE activity.user_id=$1
            UNION ALL SELECT entry.joined_at, 'CONTEST', 'Contest entry submitted', contest.title FROM demo_contest_entries entry JOIN demo_dashboard_contests contest ON contest.id=entry.contest_id WHERE entry.user_id=$1
            UNION ALL SELECT notification.created_at, 'NOTIFICATION', notification.title, notification.message FROM profile_notifications notification WHERE notification.user_id=$1
         ) activity ORDER BY occurred_at DESC LIMIT 200`, [userId]
    )).rows;
}

module.exports = { getUserActivity, getUserContests, getUserKyc, getUserNotifications, getUserOverview, getUserWallet, listUsers, listWalletDirectory };
