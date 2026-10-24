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

function normalizeAddress(network, address) {
    // Ethereum-compatible chains do not need checksum casing to identify an
    // address. Storing them consistently avoids duplicate links caused only
    // by upper/lower-case differences. TRC20 base58 addresses are case-sensitive.
    return network === "ERC20" || network === "BEP20"
        ? address.toLowerCase()
        : address;
}

async function linkUsdtWallet({ userId, network, address }) {
    const suppliedAddress = String(address || "").trim();
    assertValidWallet({ network, address: suppliedAddress });
    const normalizedAddress = normalizeAddress(network, suppliedAddress);

    // Demo environments can link a wallet independently; keep the existing
    // verification requirement in production until its policy is approved.
    if (process.env.NODE_ENV === "production") {
        const kycResult = await pool.query(
            `SELECT id FROM aadhaar_kyc_verifications
             WHERE user_id = $1 AND status = 'verified' LIMIT 1`,
            [userId]
        );
        if (kycResult.rowCount === 0) {
            throw publicError(409, "Complete Aadhaar KYC before linking a wallet");
        }
    }

    const existingWalletResult = await pool.query(
        `SELECT id, network, address, updated_at
         FROM usdt_wallets WHERE user_id = $1 LIMIT 1`,
        [userId]
    );
    const existingWallet = existingWalletResult.rows[0];

    if (existingWallet) {
        if (
            existingWallet.network === network &&
            normalizeAddress(existingWallet.network, existingWallet.address) ===
                normalizedAddress
        ) {
            return { wallet: existingWallet, alreadyLinked: true };
        }

        throw publicError(
            409,
            "A wallet is already linked. Wallet replacement requires a verified support flow."
        );
    }

    try {
        const result = await pool.query(
            `INSERT INTO usdt_wallets (user_id, network, address)
             VALUES ($1, $2, $3)
             RETURNING id, network, address, updated_at`,
            [userId, network, normalizedAddress]
        );

        return { wallet: result.rows[0], alreadyLinked: false };
    } catch (error) {
        if (error.code === "23505") {
            throw publicError(
                409,
                "This wallet address is already linked to another account"
            );
        }
        throw error;
    }
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
