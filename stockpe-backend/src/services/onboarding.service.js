const pool = require("../config/database");

function getKycMethod(provider) {
    if (provider === "uidai_secure_qr") {
        return { code: "secure_qr", label: "Secure QR" };
    }

    // The development provider represents the Aadhaar OTP path. A production
    // provider can keep this same public label without exposing vendor details.
    return { code: "aadhaar_otp", label: "OTP" };
}

async function getOnboardingStatus({ userId }) {
    const result = await pool.query(
        `SELECT
            u.mobile_verified,
            k.provider AS kyc_provider,
            k.verified_at AS kyc_verified_at,
            w.network AS wallet_network,
            w.updated_at AS wallet_linked_at
         FROM users u
         LEFT JOIN LATERAL (
            SELECT provider, verified_at
            FROM aadhaar_kyc_verifications
            WHERE user_id = u.id AND status = 'verified'
            ORDER BY verified_at DESC
            LIMIT 1
         ) k ON TRUE
         LEFT JOIN LATERAL (
            SELECT network, updated_at
            FROM usdt_wallets
            WHERE user_id = u.id
            LIMIT 1
         ) w ON TRUE
         WHERE u.id = $1`,
        [userId]
    );
    const user = result.rows[0];

    if (!user) {
        const error = new Error("User account was not found");
        error.statusCode = 404;
        error.isOperational = true;
        throw error;
    }

    const aadhaarCompleted = Boolean(user.kyc_verified_at);
    const walletLinked = Boolean(user.wallet_linked_at);
    const mobileOtpCompleted = user.mobile_verified;

    let nextStep = null;
    if (!mobileOtpCompleted) nextStep = "mobile_otp";
    else if (!aadhaarCompleted) nextStep = "aadhaar_kyc";
    else if (!walletLinked) nextStep = "wallet";

    return {
        mobileOtp: { completed: mobileOtpCompleted },
        aadhaarKyc: {
            completed: aadhaarCompleted,
            method: aadhaarCompleted ? getKycMethod(user.kyc_provider) : null,
            verifiedAt: user.kyc_verified_at || null,
        },
        wallet: {
            linked: walletLinked,
            network: user.wallet_network || null,
            linkedAt: user.wallet_linked_at || null,
        },
        onboardingCompleted: nextStep === null,
        nextStep,
    };
}

module.exports = { getOnboardingStatus };
