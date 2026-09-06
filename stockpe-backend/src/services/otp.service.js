const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const pool = require("../config/database");
const { createOtpDeliveryProvider } = require("./otp-delivery");

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
        error.isOperational = true;
        throw error;
    }

    const otp = createOtp();
    const otpHash = await bcrypt.hash(otp, 12);

    const insertResult = await pool.query(
        `INSERT INTO otp_verifications (mobile, purpose, otp_hash, expires_at)
         VALUES ($1, $2, $3, NOW() + ($4 * INTERVAL '1 minute'))
         RETURNING id`,
        [mobile, purpose, otpHash, OTP_EXPIRY_MINUTES]
    );

    try {
        const deliveryProvider = createOtpDeliveryProvider();
        await deliveryProvider.sendOtp({
            mobile,
            otp,
            purpose,
            expiresInMinutes: OTP_EXPIRY_MINUTES,
        });
    } catch (error) {
        // A failed delivery must not trigger the resend cooldown.
        await pool.query(
            "DELETE FROM otp_verifications WHERE id = $1",
            [insertResult.rows[0].id]
        );
        throw error;
    }

    return {
        expiresInSeconds: OTP_EXPIRY_MINUTES * 60,
    };
}

module.exports = {
    createOtpVerification,
};
