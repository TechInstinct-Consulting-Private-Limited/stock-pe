const bcrypt = require("bcryptjs");
const pool = require("../config/database");
const { issueSession, refreshSession, operationalError } = require("../services/auth-session.service");

const MPIN_PATTERN = /^\d{6}$/;
const DEVICE_ID_PATTERN = /^[A-Za-z0-9._:-]{16,160}$/;
const MAX_FAILED_ATTEMPTS = 5;
const LOCK_MINUTES = Number(process.env.MPIN_LOCK_MINUTES || 15);

function assertDeviceId(deviceId) {
    if (typeof deviceId !== "string" || !DEVICE_ID_PATTERN.test(deviceId)) {
        throw operationalError(400, "This device could not be verified. Please sign in again.");
    }
}

function assertMpin(mpin) {
    if (typeof mpin !== "string" || !MPIN_PATTERN.test(mpin)) {
        throw operationalError(400, "MPIN must contain exactly 6 digits.");
    }
}

async function setupMpin(req, res, next) {
    try {
        const { deviceId, mpin, biometricEnabled = false } = req.body;
        assertDeviceId(deviceId);
        assertMpin(mpin);

        const mpinHash = await bcrypt.hash(mpin, 12);
        await pool.query(
            `INSERT INTO user_auth_devices (user_id, device_id, mpin_hash, biometric_enabled, last_authenticated_at)
             VALUES ($1, $2, $3, $4, NOW())
             ON CONFLICT (user_id, device_id) DO UPDATE
             SET mpin_hash = EXCLUDED.mpin_hash,
                 biometric_enabled = EXCLUDED.biometric_enabled,
                 failed_mpin_attempts = 0,
                 locked_until = NULL,
                 revoked_at = NULL,
                 last_authenticated_at = NOW(),
                 updated_at = NOW()`,
            [req.auth.sub, deviceId, mpinHash, Boolean(biometricEnabled)],
        );
        const session = await issueSession({ userId: req.auth.sub, mobile: req.auth.mobile, deviceId });
        if (req.auth.jti) {
            await pool.query("UPDATE sessions SET revoked_at = NOW() WHERE token_jti = $1", [req.auth.jti]);
        }
        return res.status(200).json({ success: true, message: "MPIN set successfully", ...session });
    } catch (error) {
        return next(error);
    }
}

async function unlockWithMpin(req, res, next) {
    try {
        const { deviceId, mobile, mpin } = req.body;
        assertDeviceId(deviceId);
        assertMpin(mpin);
        const cleanMobile = mobile == null ? null : String(mobile).replace(/\D/g, "").slice(-10);
        if (mobile != null && !/^\d{10}$/.test(cleanMobile)) {
            throw operationalError(400, "Enter a valid mobile number and try again.");
        }

        const result = await pool.query(
            `SELECT device.id, device.user_id, device.mpin_hash, device.failed_mpin_attempts,
                    device.locked_until, app_user.mobile
             FROM user_auth_devices device
             JOIN users app_user ON app_user.id = device.user_id
             WHERE device.device_id = $1 AND device.revoked_at IS NULL
             LIMIT 1`,
            [deviceId],
        );
        const device = result.rows[0];
        if (!device) throw operationalError(401, "MPIN is not configured on this device. Please sign in again.");
        if (cleanMobile && device.mobile !== cleanMobile) {
            throw operationalError(401, "MPIN is not configured for this mobile number on this device.");
        }

        if (device.locked_until && new Date(device.locked_until) > new Date()) {
            throw operationalError(423, "Too many incorrect MPIN attempts. Please try again later or reset your MPIN.");
        }

        const matches = await bcrypt.compare(mpin, device.mpin_hash);
        if (!matches) {
            const attempts = Number(device.failed_mpin_attempts || 0) + 1;
            const lockedUntil = attempts >= MAX_FAILED_ATTEMPTS
                ? new Date(Date.now() + LOCK_MINUTES * 60_000)
                : null;
            await pool.query(
                `UPDATE user_auth_devices
                 SET failed_mpin_attempts = $2, locked_until = $3, updated_at = NOW()
                 WHERE id = $1`,
                [device.id, attempts, lockedUntil],
            );
            throw operationalError(
                attempts >= MAX_FAILED_ATTEMPTS ? 423 : 401,
                attempts >= MAX_FAILED_ATTEMPTS
                    ? "Too many incorrect MPIN attempts. Please try again later or reset your MPIN."
                    : `Incorrect MPIN. ${MAX_FAILED_ATTEMPTS - attempts} attempt(s) remaining.`,
            );
        }

        await pool.query(
            `UPDATE user_auth_devices
             SET failed_mpin_attempts = 0, locked_until = NULL, last_authenticated_at = NOW(), updated_at = NOW()
             WHERE id = $1`,
            [device.id],
        );
        const session = await issueSession({ userId: device.user_id, mobile: device.mobile, deviceId });
        return res.status(200).json({ success: true, message: "Unlocked successfully", ...session, user: { id: device.user_id, mobile: device.mobile } });
    } catch (error) {
        return next(error);
    }
}

async function refreshAuthSession(req, res, next) {
    try {
        const session = await refreshSession(req.body || {});
        return res.status(200).json({ success: true, ...session });
    } catch (error) {
        return next(error);
    }
}

async function logoutCurrentDevice(req, res, next) {
    try {
        const { deviceId } = req.body;
        assertDeviceId(deviceId);
        await pool.query(
            `UPDATE sessions SET revoked_at = NOW()
             WHERE user_id = $1 AND device_id = $2 AND revoked_at IS NULL`,
            [req.auth.sub, deviceId],
        );
        return res.status(200).json({ success: true, message: "Signed out successfully" });
    } catch (error) {
        return next(error);
    }
}

async function revokeCurrentDevice(req, res, next) {
    try {
        const { deviceId } = req.body;
        assertDeviceId(deviceId);
        await pool.query(
            `UPDATE user_auth_devices SET revoked_at = NOW(), updated_at = NOW()
             WHERE user_id = $1 AND device_id = $2`,
            [req.auth.sub, deviceId],
        );
        await pool.query(
            `UPDATE sessions SET revoked_at = NOW()
             WHERE user_id = $1 AND device_id = $2 AND revoked_at IS NULL`,
            [req.auth.sub, deviceId],
        );
        return res.status(200).json({ success: true, message: "Device signed out successfully" });
    } catch (error) {
        return next(error);
    }
}

module.exports = { setupMpin, unlockWithMpin, refreshAuthSession, logoutCurrentDevice, revokeCurrentDevice };
