const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const pool = require("../config/database");
const { createOtpDeliveryProvider } = require("./otp-delivery");
const {
    OTP_RESEND_COOLDOWN_SECONDS,
    remainingOtpCooldownSeconds,
} = require("./otpCooldown");

const OTP_EXPIRY_MINUTES = 10;

function getReviewOtpSettings(mobile, env = process.env) {
    const reviewOtp = env.REVIEW_TEST_OTP;
    const reviewMobiles = new Set(
        String(env.REVIEW_TEST_MOBILES || "")
            .split(",")
            .map((value) => value.trim())
            .filter(Boolean)
    );
    const isProduction = String(env.NODE_ENV || "").trim().toLowerCase() === "production";
    const allowEveryTestMobile = String(env.REVIEW_ALLOW_ALL_MOBILES || "").trim().toLowerCase() === "true";
    const skipDelivery = String(env.REVIEW_SKIP_OTP_DELIVERY || "").trim().toLowerCase() === "true";

    // Review builds can use a known OTP without depending on an SMS provider.
    // This is explicitly non-production only; normal OTP verification, expiry,
    // attempt limits, and session creation remain unchanged.
    if (!isProduction && /^\d{6}$/.test(reviewOtp || "") && (allowEveryTestMobile || reviewMobiles.has(mobile))) {
        return { otp: reviewOtp, skipDelivery };
    }

    return null;
}

function createOtp(mobile, env = process.env) {
    return getReviewOtpSettings(mobile, env)?.otp
        || crypto.randomInt(100000, 1000000).toString();
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
        const retryAfterSeconds = remainingOtpCooldownSeconds(
            recentOtp.rows[0].created_at
        );
        const error = new Error(
            `Please wait ${retryAfterSeconds} seconds before requesting another OTP`
        );
        error.statusCode = 429;
        error.isOperational = true;
        throw error;
    }

    const reviewSettings = getReviewOtpSettings(mobile);
    const otp = reviewSettings?.otp || createOtp(mobile);
    const otpHash = await bcrypt.hash(otp, 12);

    const insertResult = await pool.query(
        `INSERT INTO otp_verifications (mobile, purpose, otp_hash, expires_at)
         VALUES ($1, $2, $3, NOW() + ($4 * INTERVAL '1 minute'))
         RETURNING id`,
        [mobile, purpose, otpHash, OTP_EXPIRY_MINUTES]
    );

    try {
        if (!reviewSettings?.skipDelivery) {
            const deliveryProvider = createOtpDeliveryProvider();
            await deliveryProvider.sendOtp({
                mobile,
                otp,
                purpose,
                expiresInMinutes: OTP_EXPIRY_MINUTES,
            });
        }
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
    createOtp,
    createOtpVerification,
    getReviewOtpSettings,
};
