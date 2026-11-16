const pool = require("../config/database");

const ADMIN_ROLES = ["SUPER_ADMIN", "OPERATIONS_ADMIN"];

function operationalError(statusCode, message) {
    const error = new Error(message);
    error.statusCode = statusCode;
    error.isOperational = true;
    return error;
}

function assertRole(role) {
    if (!ADMIN_ROLES.includes(role)) {
        throw operationalError(400, "Choose a valid administrator role");
    }
}

async function listAdminAccess() {
    const result = await pool.query(
        `SELECT admin_account.user_id, app_user.mobile, admin_account.role,
                admin_account.created_at, admin_account.updated_at
           FROM admin_accounts admin_account
           JOIN users app_user ON app_user.id = admin_account.user_id
          ORDER BY CASE admin_account.role WHEN 'SUPER_ADMIN' THEN 0 ELSE 1 END,
                   app_user.mobile ASC`,
    );
    return result.rows;
}

async function grantAdminAccess({ mobile, role }) {
    if (!/^\d{10}$/.test(String(mobile || ""))) {
        throw operationalError(400, "Enter a valid 10-digit registered mobile number");
    }
    assertRole(role);

    const userResult = await pool.query(
        `SELECT id, mobile
           FROM users
          WHERE mobile = $1 AND mobile_verified = TRUE
          LIMIT 1`,
        [mobile],
    );
    const user = userResult.rows[0];
    if (!user) {
        throw operationalError(404, "The user must first register and verify their mobile number");
    }

    const result = await pool.query(
        `INSERT INTO admin_accounts (user_id, role)
         VALUES ($1, $2)
         ON CONFLICT (user_id)
         DO UPDATE SET role = EXCLUDED.role, updated_at = NOW()
         RETURNING user_id, role, created_at, updated_at`,
        [user.id, role],
    );
    return { ...result.rows[0], mobile: user.mobile };
}

async function updateAdminRole({ userId, role, actorUserId }) {
    assertRole(role);
    const result = await pool.query(
        `UPDATE admin_accounts
            SET role = $2, updated_at = NOW()
          WHERE user_id = $1
          RETURNING user_id, role, created_at, updated_at`,
        [userId, role],
    );
    if (!result.rowCount) throw operationalError(404, "Administrator account was not found");
    return result.rows[0];
}

async function revokeAdminAccess({ userId, actorUserId }) {
    if (userId === actorUserId) {
        throw operationalError(400, "You cannot remove your own administrator access");
    }
    const result = await pool.query(
        "DELETE FROM admin_accounts WHERE user_id = $1 RETURNING user_id, role",
        [userId],
    );
    if (!result.rowCount) throw operationalError(404, "Administrator account was not found");
    return result.rows[0];
}

module.exports = {
    ADMIN_ROLES,
    grantAdminAccess,
    listAdminAccess,
    revokeAdminAccess,
    updateAdminRole,
};
