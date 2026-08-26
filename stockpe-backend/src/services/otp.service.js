const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const pool = require("../config/database");

const OTP_EXPIRY_MINUTES = 10;
const OTP_RESEND_COOLDOWN_SECONDS = 60;

function createOtp() {
    return crypto.randomInt(100000, 1000000).toString();
}

async function createOtpVerification(mobile, purpose) {
    const recentOtp = await pool.query(
        `SELECT created_at
         FROM otp_verifications
         WHERE mobile = $1
           AND purpose = $2
           AND created_at > NOW() - ($3 * INTERVAL '1 second')
         ORDER BY created_at DESC
         LIMIT 1`,
        [mobile, purpose, OTP_RESEND_COOLDOWN_SECONDS]
    );

    if (recentOtp.rowCount > 0) {
        const error = new Error(
            `Please wait ${OTP_RESEND_COOLDOWN_SECONDS} seconds before requesting another OTP`
        );
        error.statusCode = 429;
        throw error;
    }

    const otp = createOtp();
    const otpHash = await bcrypt.hash(otp, 12);

    await pool.query(
        `INSERT INTO otp_verifications (mobile, purpose, otp_hash, expires_at)
         VALUES ($1, $2, $3, NOW() + ($4 * INTERVAL '1 minute'))`,
        [mobile, purpose, otpHash, OTP_EXPIRY_MINUTES]
    );

    // Replace this development-only delivery with an approved SMS provider before launch.
    if (process.env.NODE_ENV !== "production") {
        console.log(`[DEV OTP] ${purpose} OTP for ${mobile}: ${otp}`);
    }

    return {
        expiresInSeconds: OTP_EXPIRY_MINUTES * 60,
    };
}

module.exports = {
    createOtpVerification,
};
