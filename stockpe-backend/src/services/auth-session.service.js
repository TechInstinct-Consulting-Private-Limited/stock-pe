const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const pool = require("../config/database");

function operationalError(statusCode, message) {
    const error = new Error(message);
    error.statusCode = statusCode;
    error.isOperational = true;
    return error;
}

function getJwtSecret() {
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
        throw new Error("JWT_SECRET must be set to a value of at least 32 characters");
    }
    return process.env.JWT_SECRET;
}

function readDuration(value, fallback) {
    const input = String(value || fallback).trim();
    const match = /^(\d+)\s*([smhd])$/i.exec(input);
    if (!match) return readDuration(fallback, "30d");
    const multiplier = { s: 1_000, m: 60_000, h: 3_600_000, d: 86_400_000 }[match[2].toLowerCase()];
    return Number(match[1]) * multiplier;
}

function accessTokenDuration() {
    return process.env.JWT_ACCESS_EXPIRES_IN || "15m";
}

function refreshTokenDurationMs() {
    return readDuration(process.env.JWT_REFRESH_EXPIRES_IN, "30d");
}

function hashRefreshToken(value) {
    return crypto.createHash("sha256").update(value).digest("hex");
}

function createRefreshToken() {
    return crypto.randomBytes(48).toString("base64url");
}

async function issueSession({ userId, mobile, deviceId = null }) {
    const tokenJti = crypto.randomUUID();
    const token = jwt.sign(
        { sub: userId, mobile, jti: tokenJti },
        getJwtSecret(),
        { expiresIn: accessTokenDuration() },
    );
    const tokenPayload = jwt.decode(token);
    const refreshToken = createRefreshToken();
    const refreshExpiresAt = new Date(Date.now() + refreshTokenDurationMs());

    await pool.query(
        `INSERT INTO sessions (
            user_id, token_jti, expires_at, refresh_token_hash, refresh_expires_at, device_id, refreshed_at
         ) VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
        [
            userId,
            tokenJti,
            new Date(tokenPayload.exp * 1000),
            hashRefreshToken(refreshToken),
            refreshExpiresAt,
            deviceId || null,
        ],
    );

    return { token, refreshToken, accessTokenExpiresAt: new Date(tokenPayload.exp * 1000).toISOString() };
}

async function refreshSession({ refreshToken, deviceId }) {
    if (typeof refreshToken !== "string" || !refreshToken || typeof deviceId !== "string" || !deviceId) {
        throw operationalError(401, "Your session has expired. Please sign in again.");
    }

    const sessionResult = await pool.query(
        `SELECT session.id, session.user_id, app_user.mobile
         FROM sessions session
         JOIN users app_user ON app_user.id = session.user_id
         JOIN user_auth_devices device
           ON device.user_id = session.user_id
          AND device.device_id = session.device_id
          AND device.revoked_at IS NULL
         WHERE session.refresh_token_hash = $1
           AND session.device_id = $2
           AND session.revoked_at IS NULL
           AND session.refresh_expires_at > NOW()
         LIMIT 1`,
        [hashRefreshToken(refreshToken), deviceId],
    );
    const session = sessionResult.rows[0];
    if (!session) throw operationalError(401, "Your session has expired. Please sign in again.");

    await pool.query("UPDATE sessions SET revoked_at = NOW() WHERE id = $1", [session.id]);
    return issueSession({ userId: session.user_id, mobile: session.mobile, deviceId });
}

async function requireActiveSession(tokenJti) {
    const result = await pool.query(
        "SELECT id FROM sessions WHERE token_jti = $1 AND revoked_at IS NULL AND expires_at > NOW() LIMIT 1",
        [tokenJti],
    );
    return Boolean(result.rowCount);
}

module.exports = {
    getJwtSecret,
    issueSession,
    refreshSession,
    requireActiveSession,
    operationalError,
};
