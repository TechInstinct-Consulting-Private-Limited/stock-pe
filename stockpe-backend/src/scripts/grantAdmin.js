require("dotenv").config();

const pool = require("../config/database");

const [mobile, role = "SUPER_ADMIN"] = process.argv.slice(2);
const allowedRoles = new Set(["SUPER_ADMIN", "OPERATIONS_ADMIN"]);

async function grantAdmin() {
    if (!/^\d{10}$/.test(mobile || "") || !allowedRoles.has(role)) {
        throw new Error("Usage: npm run admin:grant -- <10-digit-mobile> <SUPER_ADMIN|OPERATIONS_ADMIN>");
    }
    const result = await pool.query(
        `INSERT INTO admin_accounts (user_id, role)
         SELECT id, $2 FROM users WHERE mobile=$1 AND mobile_verified=TRUE
         ON CONFLICT (user_id) DO UPDATE SET role=EXCLUDED.role,updated_at=NOW()
         RETURNING role`,
        [mobile, role]
    );
    if (!result.rowCount) throw new Error("Create and verify the user account before granting admin access");
    console.log(`Granted ${result.rows[0].role} access to ${mobile}`);
}

grantAdmin()
    .catch((error) => { console.error(error.message); process.exitCode = 1; })
    .finally(() => pool.end());
