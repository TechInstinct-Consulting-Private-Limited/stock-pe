const pool = require("../config/database");

function requireAdmin(allowedRoles = ["SUPER_ADMIN", "OPERATIONS_ADMIN"]) {
    return async (req, res, next) => {
        try {
            const result = await pool.query(
                "SELECT role FROM admin_accounts WHERE user_id = $1",
                [req.auth?.sub]
            );
            const role = result.rows[0]?.role;

            if (!role || !allowedRoles.includes(role)) {
                return res.status(403).json({ success: false, message: "Administrator access is required" });
            }

            req.admin = { userId: req.auth.sub, role };
            return next();
        } catch (error) {
            return next(error);
        }
    };
}

module.exports = { requireAdmin };
