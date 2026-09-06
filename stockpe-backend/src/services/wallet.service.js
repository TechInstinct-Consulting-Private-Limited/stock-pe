const pool = require("../config/database");

// Address shapes are network specific, so validation is per network rather
// than one loose regex.
const NETWORK_RULES = {
    TRC20: /^T[1-9A-HJ-NP-Za-km-z]{33}$/,
    ERC20: /^0x[0-9a-fA-F]{40}$/,
    BEP20: /^0x[0-9a-fA-F]{40}$/,
};

const SUPPORTED_NETWORKS = Object.keys(NETWORK_RULES);

function publicError(statusCode, message) {
    const error = new Error(message);
    error.statusCode = statusCode;
    error.isOperational = true;
    return error;
}

function assertValidWallet({ network, address }) {
    const rule = NETWORK_RULES[network];

    if (!rule) {
        throw publicError(
            400,
            `Network must be one of ${SUPPORTED_NETWORKS.join(", ")}`
        );
    }

    if (!rule.test(address)) {
        throw publicError(400, `This is not a valid ${network} USDT address`);
    }
}

async function linkUsdtWallet({ userId, network, address }) {
    const trimmedAddress = String(address || "").trim();
    assertValidWallet({ network, address: trimmedAddress });

    const kycResult = await pool.query(
        `SELECT id FROM aadhaar_kyc_verifications
         WHERE user_id = $1 AND status = 'verified' LIMIT 1`,
        [userId]
    );

    if (kycResult.rowCount === 0) {
        throw publicError(409, "Complete Aadhaar KYC before linking a wallet");
    }

    const result = await pool.query(
        `INSERT INTO usdt_wallets (user_id, network, address)
         VALUES ($1, $2, $3)
         ON CONFLICT (user_id) DO UPDATE
            SET network = EXCLUDED.network,
                address = EXCLUDED.address,
                updated_at = NOW()
         RETURNING id, network, address, updated_at`,
        [userId, network, trimmedAddress]
    );

    return { wallet: result.rows[0] };
}

async function getUsdtWallet({ userId }) {
    const result = await pool.query(
        `SELECT id, network, address, updated_at
         FROM usdt_wallets WHERE user_id = $1 LIMIT 1`,
        [userId]
    );

    return { wallet: result.rows[0] || null };
}

module.exports = {
    SUPPORTED_NETWORKS,
    getUsdtWallet,
    linkUsdtWallet,
};
