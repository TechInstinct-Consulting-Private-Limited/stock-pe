require("dotenv").config();

const pool = require("../config/database");

async function checkDatabase() {
    try {
        const result = await pool.query(
            "SELECT current_database() AS database_name, NOW() AS database_time"
        );

        console.log(`Connected to ${result.rows[0].database_name}`);
        console.log(`Database time: ${result.rows[0].database_time.toISOString()}`);
    } finally {
        await pool.end();
    }
}

checkDatabase().catch((error) => {
    console.error("Database connection failed:", error.message);
    process.exitCode = 1;
});
