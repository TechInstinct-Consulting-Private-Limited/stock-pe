const pool = require("../config/database");
const { createAadhaarKycProvider } = require("./aadhaar-kyc");

const MAX_OTP_ATTEMPTS = 5;

function normalizedDateOfBirth(value) {
    if (typeof value === "number" && Number.isFinite(value)) {
        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? null : date.toISOString().slice(0, 10);
    }
    if (typeof value !== "string") return null;

    const trimmed = value.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;

    const match = trimmed.match(/^(\d{2})[/-](\d{2})[/-](\d{4})$/);
    if (!match) return null;

    return `${match[3]}-${match[2]}-${match[1]}`;
}

function safeKycData(kycData) {
    const fullName = typeof kycData?.fullName === "string"
        ? kycData.fullName.trim().slice(0, 120)
        : null;

    return {
        fullName,
        dateOfBirth: normalizedDateOfBirth(kycData?.dateOfBirth),
        isMock: Boolean(kycData?.isMock),
    };
}

function publicError(statusCode, message) {
    const error = new Error(message);
    error.statusCode = statusCode;
    error.isOperational = true;
    return error;
}

// Provider messages are useful operational feedback (for example, an exhausted
// sandbox credit balance), but must never echo identity data or credentials to
// the mobile client. Keep only a short, non-sensitive plain-text explanation.
function safeProviderReason(reason, fallback) {
    const message = typeof reason === "string"
        ? reason.replace(/\s+/g, " ").trim().slice(0, 160)
        : "";

    if (!message) return fallback;

    // The words "Aadhaar" and "OTP" are safe and help the user understand a
    // provider response. Redact only the values that could be sensitive.
    return message
        .replace(/\b\d{12}\b/g, "[redacted Aadhaar number]")
        .replace(/\b\d{6}\b/g, "[redacted OTP]")
        .replace(/\b(api[ _-]?key|secret|authorization|token)\b\s*[:=]?\s*\S+/gi, "$1: [redacted]");
}

function assertDigiLockerRedirectUrl() {
    const value = String(process.env.DIGILOCKER_REDIRECT_URL || "").trim();
    if (!/^https:\/\/.+/i.test(value)) {
        throw publicError(503, "DigiLocker verification is not configured yet. Please try again later.");
    }
    return value;
}

async function initiateDigiLockerKyc({ userId }) {
    const existing = await pool.query(
        "SELECT id FROM aadhaar_kyc_verifications WHERE user_id=$1 AND status='verified' LIMIT 1",
        [userId]
    );
    if (existing.rowCount) throw publicError(409, "KYC is already verified");

    const provider = createAadhaarKycProvider({ providerName: "sandbox_digilocker" });
    const result = await provider.initiateSession({ redirectUrl: assertDigiLockerRedirectUrl() });
    if (!result.accepted) {
        throw publicError(400, safeProviderReason(result.reason, "Could not start DigiLocker verification. Please try again later."));
    }

    const verification = await pool.query(
        `INSERT INTO aadhaar_kyc_verifications (
            user_id, provider, provider_transaction_id, aadhaar_last_four,
            status, consent_given_at, expires_at
         ) VALUES ($1,$2,$3,NULL,'consent_pending',NOW(),NOW() + ($4 * INTERVAL '1 second'))
         RETURNING id, status, expires_at`,
        [userId, provider.name, result.sessionId, result.expiresInSeconds]
    );

    return {
        verificationId: verification.rows[0].id,
        status: verification.rows[0].status,
        authorizationUrl: result.authorizationUrl,
        expiresInSeconds: result.expiresInSeconds,
    };
}

async function refreshDigiLockerKyc({ userId, verificationId }) {
    const recordResult = await pool.query(
        `SELECT id, provider, provider_transaction_id, status, expires_at
         FROM aadhaar_kyc_verifications WHERE id=$1 AND user_id=$2 LIMIT 1`,
        [verificationId, userId]
    );
    const verification = recordResult.rows[0];
    if (!verification) throw publicError(404, "DigiLocker verification was not found");
    if (verification.provider !== "sandbox_digilocker") throw publicError(409, "This is not a DigiLocker verification");
    if (verification.status === "verified") return { verificationId, status: "verified", completed: true };
    if (verification.status !== "consent_pending") return { verificationId, status: verification.status, completed: false };

    if (new Date(verification.expires_at) <= new Date()) {
        await pool.query("UPDATE aadhaar_kyc_verifications SET status='expired', updated_at=NOW() WHERE id=$1", [verification.id]);
        return { verificationId, status: "expired", completed: false };
    }

    const provider = createAadhaarKycProvider({ providerName: verification.provider });
    const session = await provider.getSessionStatus({ sessionId: verification.provider_transaction_id });
    if (!session.accepted) throw publicError(400, safeProviderReason(session.reason, "Could not check DigiLocker verification. Please try again later."));

    if (session.status === "failed" || session.status === "expired") {
        await pool.query("UPDATE aadhaar_kyc_verifications SET status=$1, updated_at=NOW() WHERE id=$2", [session.status, verification.id]);
        return { verificationId, status: session.status, completed: false };
    }
    if (session.status !== "succeeded") return { verificationId, status: "consent_pending", completed: false };
    if (!session.documentsConsented.includes("aadhaar")) {
        await pool.query("UPDATE aadhaar_kyc_verifications SET status='failed', updated_at=NOW() WHERE id=$1", [verification.id]);
        throw publicError(400, "Aadhaar document consent was not provided");
    }

    const profile = await provider.getUserProfile({ sessionId: verification.provider_transaction_id });
    if (!profile.accepted) throw publicError(400, safeProviderReason(profile.reason, "Could not retrieve the DigiLocker profile. Please try again later."));
    const kycData = safeKycData(profile.kycData);

    await pool.query(
        `UPDATE aadhaar_kyc_verifications
         SET status='verified', full_name=$1, date_of_birth=$2, verified_at=NOW(), updated_at=NOW()
         WHERE id=$3`,
        [kycData.fullName, kycData.dateOfBirth, verification.id]
    );
    return { verificationId, status: "verified", completed: true, kycData };
}

async function refreshDigiLockerKycBySession({ userId, sessionId }) {
    const recordResult = await pool.query(
        `SELECT id
         FROM aadhaar_kyc_verifications
         WHERE user_id=$1 AND provider='sandbox_digilocker' AND provider_transaction_id=$2
         ORDER BY created_at DESC
         LIMIT 1`,
        [userId, sessionId]
    );
    const verification = recordResult.rows[0];
    if (!verification) throw publicError(404, "DigiLocker verification was not found");
    return refreshDigiLockerKyc({ userId, verificationId: verification.id });
}

async function requestAadhaarOtp({ userId, aadhaarNumber, fullName }) {
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
        throw publicError(400, safeProviderReason(
            providerResult.reason,
            "The Aadhaar KYC request was rejected. Please try again later."
        ));
    }

    const insertResult = await pool.query(
        `INSERT INTO aadhaar_kyc_verifications (
            user_id,
            provider,
            provider_transaction_id,
            aadhaar_last_four,
            status,
            consent_given_at,
            expires_at,
            full_name
         )
         VALUES ($1, $2, $3, $4, 'otp_sent', NOW(), NOW() + ($5 * INTERVAL '1 second'), $6)
         RETURNING id, status, expires_at`,
        [
            userId,
            provider.name,
            providerResult.transactionId,
            aadhaarNumber.slice(-4),
            providerResult.expiresInSeconds,
            typeof fullName === "string" ? fullName.trim().slice(0, 120) || null : null,
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
        `SELECT id, provider, provider_transaction_id, full_name, status, attempts, expires_at
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
        throw publicError(400, providerResult.reason || "Aadhaar OTP is invalid");
    }

    const verifiedKycData = safeKycData(providerResult.kycData);
    // Development KYC has no official identity lookup. Preserve the name the
    // user supplied in the Aadhaar form; production providers take precedence.
    const verifiedName = verification.provider === "mock"
        ? verification.full_name || verifiedKycData.fullName
        : verifiedKycData.fullName || verification.full_name;
    const verifiedDob = verifiedKycData.dateOfBirth;

    await pool.query(
        `UPDATE aadhaar_kyc_verifications
         SET status = 'verified', full_name = $1, date_of_birth = $2,
             verified_at = NOW(), updated_at = NOW()
         WHERE id = $3`,
        [verifiedName || null, verifiedDob || null, verification.id]
    );

    return {
        verificationId: verification.id,
        status: "verified",
        kycData: verifiedKycData,
    };
}

async function getAadhaarKycStatus({ userId }) {
    const result = await pool.query(
        `SELECT id, aadhaar_last_four, full_name, status, verified_at, created_at
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
        fullName: verification.full_name || null,
        status: verification.status,
        verifiedAt: verification.verified_at,
        createdAt: verification.created_at,
    };
}

module.exports = {
    getAadhaarKycStatus,
    initiateDigiLockerKyc,
    requestAadhaarOtp,
    refreshDigiLockerKyc,
    refreshDigiLockerKycBySession,
    verifyAadhaarOtp,
};
