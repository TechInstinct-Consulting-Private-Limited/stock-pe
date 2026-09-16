const pool = require("../config/database");
const { createAadhaarKycProvider } = require("./aadhaar-kyc");

const MAX_OTP_ATTEMPTS = 5;

function publicError(statusCode, message) {
    const error = new Error(message);
    error.statusCode = statusCode;
    error.isOperational = true;
    return error;
}

async function requestAadhaarOtp({ userId, aadhaarNumber }) {
    const existingResult = await pool.query(
        `SELECT id
         FROM aadhaar_kyc_verifications
         WHERE user_id = $1 AND status = 'verified'
         LIMIT 1`,
        [userId]
    );

    if (existingResult.rowCount > 0) {
        throw publicError(409, "Aadhaar KYC is already verified");
    }

    const provider = createAadhaarKycProvider();
    const providerResult = await provider.requestOtp({ aadhaarNumber });

    if (!providerResult.accepted) {
        throw publicError(400, "The Aadhaar KYC request was rejected");
    }

    const insertResult = await pool.query(
        `INSERT INTO aadhaar_kyc_verifications (
            user_id,
            provider,
            provider_transaction_id,
            aadhaar_last_four,
            status,
            consent_given_at,
            expires_at
         )
         VALUES ($1, $2, $3, $4, 'otp_sent', NOW(), NOW() + ($5 * INTERVAL '1 second'))
         RETURNING id, status, expires_at`,
        [
            userId,
            provider.name,
            providerResult.transactionId,
            aadhaarNumber.slice(-4),
            providerResult.expiresInSeconds,
        ]
    );
    const verification = insertResult.rows[0];

    return {
        verificationId: verification.id,
        status: verification.status,
        expiresInSeconds: providerResult.expiresInSeconds,
    };
}

async function verifyAadhaarOtp({ userId, verificationId, otp }) {
    const verificationResult = await pool.query(
        `SELECT id, provider, provider_transaction_id, status, attempts, expires_at
         FROM aadhaar_kyc_verifications
         WHERE id = $1 AND user_id = $2
         LIMIT 1`,
        [verificationId, userId]
    );
    const verification = verificationResult.rows[0];

    if (!verification) {
        throw publicError(404, "Aadhaar KYC verification was not found");
    }

    if (verification.status !== "otp_sent") {
        throw publicError(409, `Aadhaar KYC is ${verification.status}`);
    }

    if (
        verification.attempts >= MAX_OTP_ATTEMPTS ||
        new Date(verification.expires_at) <= new Date()
    ) {
        await pool.query(
            `UPDATE aadhaar_kyc_verifications
             SET status = 'expired', updated_at = NOW()
             WHERE id = $1`,
            [verification.id]
        );
        throw publicError(400, "Aadhaar OTP is expired. Request a new OTP.");
    }

    const provider = createAadhaarKycProvider({
        providerName: verification.provider,
    });
    const providerResult = await provider.verifyOtp({
        transactionId: verification.provider_transaction_id,
        otp,
    });

    if (!providerResult.verified) {
        await pool.query(
            `UPDATE aadhaar_kyc_verifications
             SET attempts = attempts + 1, updated_at = NOW()
             WHERE id = $1`,
            [verification.id]
        );
        throw publicError(400, "Aadhaar OTP is invalid");
    }

    await pool.query(
        `UPDATE aadhaar_kyc_verifications
         SET status = 'verified', verified_at = NOW(), updated_at = NOW()
         WHERE id = $1`,
        [verification.id]
    );

    return {
        verificationId: verification.id,
        status: "verified",
        kycData: providerResult.kycData,
    };
}

async function getAadhaarKycStatus({ userId }) {
    const result = await pool.query(
        `SELECT id, aadhaar_last_four, status, verified_at, created_at
         FROM aadhaar_kyc_verifications
         WHERE user_id = $1
         ORDER BY created_at DESC
         LIMIT 1`,
        [userId]
    );
    const verification = result.rows[0];

    if (!verification) {
        return { status: "not_started" };
    }

    return {
        verificationId: verification.id,
        aadhaarLastFour: verification.aadhaar_last_four,
        status: verification.status,
        verifiedAt: verification.verified_at,
        createdAt: verification.created_at,
    };
}

module.exports = {
    getAadhaarKycStatus,
    requestAadhaarOtp,
    verifyAadhaarOtp,
};
