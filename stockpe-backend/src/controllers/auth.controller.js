const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const pool = require("../config/database");
const { createOtpVerification } = require("../services/otp.service");

const MOBILE_PATTERN = /^[6-9]\d{9}$/;
const MAX_OTP_ATTEMPTS = 5;

function validateMobile(mobile) {
    return typeof mobile === "string" && MOBILE_PATTERN.test(mobile);
}

function validatePassword(password) {
    return typeof password === "string" && password.length >= 8;
}

function validationError(res, message) {
    return res.status(400).json({ success: false, message });
}

function getJwtSecret() {
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
        throw new Error("JWT_SECRET must be set to a value of at least 32 characters");
    }

    return process.env.JWT_SECRET;
}

async function signUp(req, res, next) {
    try {
        const { mobile, password } = req.body;

        if (!validateMobile(mobile)) {
            return validationError(res, "Enter a valid 10-digit Indian mobile number");
        }

        if (!validatePassword(password)) {
            return validationError(res, "Password must be at least 8 characters");
        }

        const existingUser = await pool.query(
            "SELECT id, mobile_verified FROM users WHERE mobile = $1",
            [mobile]
        );
        const user = existingUser.rows[0];

        if (user?.mobile_verified) {
            return res.status(409).json({
                success: false,
                message: "An account already exists for this mobile number",
            });
        }

        const passwordHash = await bcrypt.hash(password, 12);
        if (user) {
            await pool.query(
                `UPDATE users
                 SET password_hash = $1, updated_at = NOW()
                 WHERE id = $2`,
                [passwordHash, user.id]
            );
        } else {
            await pool.query(
                "INSERT INTO users (mobile, password_hash) VALUES ($1, $2)",
                [mobile, passwordHash]
            );
        }

        const otpDetails = await createOtpVerification(mobile, "signup");
        return res.status(user ? 200 : 201).json({
            success: true,
            message: "OTP sent for mobile verification",
            ...otpDetails,
        });
    } catch (error) {
        return next(error);
    }
}

async function signIn(req, res, next) {
    try {
        const { mobile, password } = req.body;

        if (!validateMobile(mobile) || typeof password !== "string") {
            return validationError(res, "Invalid mobile number or password");
        }

        const result = await pool.query(
            "SELECT id, password_hash, mobile_verified FROM users WHERE mobile = $1",
            [mobile]
        );
        const user = result.rows[0];

        if (!user || !(await bcrypt.compare(password, user.password_hash))) {
            return res.status(401).json({
                success: false,
                message: "Invalid mobile number or password",
            });
        }

        if (!user.mobile_verified) {
            return res.status(403).json({
                success: false,
                message: "Verify your mobile number before signing in",
            });
        }

        const otpDetails = await createOtpVerification(mobile, "signin");
        return res.status(200).json({
            success: true,
            message: "OTP sent for sign in",
            ...otpDetails,
        });
    } catch (error) {
        return next(error);
    }
}

async function verifyOtp(req, res, next) {
    try {
        const { mobile, otp, purpose } = req.body;

        if (!validateMobile(mobile) || !["signup", "signin"].includes(purpose)) {
            return validationError(res, "Invalid OTP verification request");
        }

        if (typeof otp !== "string" || !/^\d{6}$/.test(otp)) {
            return validationError(res, "OTP must contain 6 digits");
        }

        const otpResult = await pool.query(
            `SELECT id, otp_hash, attempts
             FROM otp_verifications
             WHERE mobile = $1
               AND purpose = $2
               AND consumed_at IS NULL
               AND expires_at > NOW()
             ORDER BY created_at DESC
             LIMIT 1`,
            [mobile, purpose]
        );
        const verification = otpResult.rows[0];

        if (!verification || verification.attempts >= MAX_OTP_ATTEMPTS) {
            return res.status(400).json({
                success: false,
                message: "OTP is invalid or expired. Request a new OTP.",
            });
        }

        const isValidOtp = await bcrypt.compare(otp, verification.otp_hash);
        if (!isValidOtp) {
            await pool.query(
                "UPDATE otp_verifications SET attempts = attempts + 1 WHERE id = $1",
                [verification.id]
            );
            return res.status(400).json({
                success: false,
                message: "OTP is invalid or expired",
            });
        }

        const userResult = await pool.query(
            "SELECT id, mobile FROM users WHERE mobile = $1",
            [mobile]
        );
        const user = userResult.rows[0];

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User account was not found",
            });
        }

        await pool.query(
            "UPDATE otp_verifications SET consumed_at = NOW() WHERE id = $1",
            [verification.id]
        );

        if (purpose === "signup") {
            await pool.query(
                "UPDATE users SET mobile_verified = TRUE, updated_at = NOW() WHERE id = $1",
                [user.id]
            );
        }

        const tokenJti = crypto.randomUUID();
        const token = jwt.sign(
            { sub: user.id, mobile: user.mobile, jti: tokenJti },
            getJwtSecret(),
            { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
        );
        const tokenPayload = jwt.decode(token);
        const expiresAt = new Date(tokenPayload.exp * 1000);

        await pool.query(
            "INSERT INTO sessions (user_id, token_jti, expires_at) VALUES ($1, $2, $3)",
            [user.id, tokenJti, expiresAt]
        );

        return res.status(200).json({
            success: true,
            message: "Mobile verified successfully",
            token,
            user: { id: user.id, mobile: user.mobile },
        });
    } catch (error) {
        return next(error);
    }
}

async function resendOtp(req, res, next) {
    try {
        const { mobile, purpose } = req.body;

        if (!validateMobile(mobile) || !["signup", "signin"].includes(purpose)) {
            return validationError(res, "Invalid OTP resend request");
        }

        const userResult = await pool.query(
            "SELECT mobile_verified FROM users WHERE mobile = $1",
            [mobile]
        );
        const user = userResult.rows[0];

        if (!user || (purpose === "signup" && user.mobile_verified)) {
            return res.status(400).json({
                success: false,
                message: "OTP cannot be resent for this account",
            });
        }

        if (purpose === "signin" && !user.mobile_verified) {
            return res.status(403).json({
                success: false,
                message: "Verify your mobile number before signing in",
            });
        }

        const otpDetails = await createOtpVerification(mobile, purpose);
        return res.status(200).json({
            success: true,
            message: "OTP resent successfully",
            ...otpDetails,
        });
    } catch (error) {
        return next(error);
    }
}

module.exports = { resendOtp, signIn, signUp, verifyOtp };
