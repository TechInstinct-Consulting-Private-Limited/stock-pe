const pool = require("../config/database");

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
                admin.role AS admin_role
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
        adminRole: row.admin_role || null,
        joinedAt: row.created_at,
    }));
}

module.exports = { listUsers };
