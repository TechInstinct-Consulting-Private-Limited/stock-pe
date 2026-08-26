const express = require("express");
const pool = require("../config/database");

const router = express.Router();

router.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "StockPE API is running",
    });
});

router.get("/database", async (req, res, next) => {
    try {
        const result = await pool.query("SELECT NOW() AS database_time");

        res.status(200).json({
            success: true,
            message: "PostgreSQL connection is working",
            databaseTime: result.rows[0].database_time,
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
