const { Pool } = require("pg");

const requiredSettings = ["DB_HOST", "DB_NAME", "DB_USER"];

function validateDatabaseSettings() {
    const missingSettings = requiredSettings.filter(
        (setting) => !process.env[setting]
    );

    if (missingSettings.length > 0) {
        throw new Error(
            `Missing database environment settings: ${missingSettings.join(", ")}`
        );
    }
}

validateDatabaseSettings();

const pool = new Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 5432),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
});

pool.on("error", (error) => {
    console.error("Unexpected PostgreSQL pool error", error);
});

module.exports = pool;
