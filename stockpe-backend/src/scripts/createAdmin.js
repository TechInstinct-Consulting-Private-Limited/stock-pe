require("dotenv").config();

const bcrypt = require("bcryptjs");
const pool = require("../config/database");

const MOBILE_PATTERN = /^[6-9]\d{9}$/;

async function createOrResetAdmin() {
  const mobile = process.argv[2] || "9876543210";
  const password = process.argv[3] || "Admin@1234";

  if (!MOBILE_PATTERN.test(mobile)) {
    console.error("❌ Error: Mobile number must be a valid 10-digit Indian number starting with 6-9.");
    process.exit(1);
  }

  if (typeof password !== "string" || password.length < 8) {
    console.error("❌ Error: Password must be at least 8 characters long.");
    process.exit(1);
  }

  try {
    const passwordHash = await bcrypt.hash(password, 12);

    const checkResult = await pool.query(
      "SELECT id FROM users WHERE mobile = $1",
      [mobile]
    );

    if (checkResult.rows.length > 0) {
      await pool.query(
        `UPDATE users 
         SET password_hash = $1, mobile_verified = TRUE, updated_at = NOW() 
         WHERE mobile = $2`,
        [passwordHash, mobile]
      );
      console.log(`✅ Existing user updated successfully!`);
    } else {
      await pool.query(
        `INSERT INTO users (mobile, password_hash, mobile_verified) 
         VALUES ($1, $2, TRUE)`,
        [mobile, passwordHash]
      );
      console.log(`✅ New admin user created successfully!`);
    }

    console.log("-----------------------------------------");
    console.log(`📱 Mobile   : ${mobile}`);
    console.log(`🔑 Password : ${password}`);
    console.log(`✔️  Verified : TRUE`);
    console.log("-----------------------------------------");
    console.log("You can now log into the Admin Console with these credentials.");
  } catch (error) {
    console.error("❌ Failed to create/update admin user:", error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

createOrResetAdmin();
