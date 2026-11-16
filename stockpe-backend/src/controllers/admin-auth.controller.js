const bcrypt = require("bcryptjs");
const pool = require("../config/database");
const { issueSession, refreshAdminSession } = require("../services/auth-session.service");

function publicError(statusCode, message) {
    const error = new Error(message);
    error.statusCode = statusCode;
    error.isOperational = true;
    return error;
}

function bootstrapConfig() {
    return {
        enabled: process.env.ADMIN_BOOTSTRAP_ENABLED === "true",
        mobile: process.env.ADMIN_BOOTSTRAP_MOBILE || "",
        password: process.env.ADMIN_BOOTSTRAP_PASSWORD || "",
    };
}

async function ensureBootstrapAdministrator({ mobile, password }) {
    const config = bootstrapConfig();
    if (!config.enabled || mobile !== config.mobile || password !== config.password) return null;

    const existing = await pool.query(
        "SELECT id, mobile FROM users WHERE mobile = $1 LIMIT 1",
        [mobile],
    );
    let user = existing.rows[0];
    if (!user) {
        const passwordHash = await bcrypt.hash(password, 12);
        const created = await pool.query(
            `INSERT INTO users (mobile, password_hash, mobile_verified)
             VALUES ($1, $2, TRUE)
             RETURNING id, mobile`,
            [mobile, passwordHash],
        );
        user = created.rows[0];
    }

    await pool.query(
        `INSERT INTO admin_accounts (user_id, role)
         VALUES ($1, 'SUPER_ADMIN')
         ON CONFLICT (user_id)
         DO UPDATE SET role = 'SUPER_ADMIN', updated_at = NOW()`,
        [user.id],
    );
    return { ...user, role: "SUPER_ADMIN" };
}

async function login(req, res, next) {
    try {
        const mobile = String(req.body?.mobile || "").trim();
        const password = String(req.body?.password || "");
        if (!/^\d{10}$/.test(mobile) || !password) {
            throw publicError(400, "Enter a valid mobile number and password");
        }

        let admin = await ensureBootstrapAdministrator({ mobile, password });
        if (!admin) {
            const result = await pool.query(
                `SELECT app_user.id, app_user.mobile, app_user.password_hash, admin_account.role
                   FROM users app_user
                   JOIN admin_accounts admin_account ON admin_account.user_id = app_user.id
                  WHERE app_user.mobile = $1
                    AND app_user.mobile_verified = TRUE
                  LIMIT 1`,
                [mobile],
            );
            const user = result.rows[0];
            if (!user || !(await bcrypt.compare(password, user.password_hash))) {
                throw publicError(401, "Invalid administrator credentials");
            }
            admin = user;
        }

        const session = await issueSession({ userId: admin.id, mobile: admin.mobile });
        return res.status(200).json({
            success: true,
            message: "Administrator session started",
            ...session,
            administrator: { id: admin.id, mobile: admin.mobile, role: admin.role },
        });
    } catch (error) {
        return next(error);
    }
}

async function refresh(req, res, next) {
    try {
        const session = await refreshAdminSession(req.body || {});
        return res.status(200).json({ success: true, ...session });
    } catch (error) {
        return next(error);
    }
}

module.exports = { login, refresh };
