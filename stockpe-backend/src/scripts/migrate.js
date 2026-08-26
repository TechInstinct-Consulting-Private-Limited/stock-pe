require("dotenv").config();

const fs = require("fs/promises");
const path = require("path");
const pool = require("../config/database");

const migrationsDirectory = path.join(__dirname, "..", "database", "migrations");

async function runMigrations() {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");
        await client.query(`
            CREATE TABLE IF NOT EXISTS schema_migrations (
                filename TEXT PRIMARY KEY,
                applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        `);

        const appliedResult = await client.query(
            "SELECT filename FROM schema_migrations"
        );
        const appliedMigrations = new Set(
            appliedResult.rows.map((row) => row.filename)
        );
        const migrationFiles = (await fs.readdir(migrationsDirectory))
            .filter((filename) => filename.endsWith(".sql"))
            .sort();

        for (const filename of migrationFiles) {
            if (appliedMigrations.has(filename)) {
                continue;
            }

            const sql = await fs.readFile(
                path.join(migrationsDirectory, filename),
                "utf8"
            );

            await client.query(sql);
            await client.query(
                "INSERT INTO schema_migrations (filename) VALUES ($1)",
                [filename]
            );
            console.log(`Applied migration: ${filename}`);
        }

        await client.query("COMMIT");
        console.log("Database migrations are up to date.");
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

runMigrations().catch((error) => {
    console.error("Migration failed:", error.message);
    process.exitCode = 1;
});
