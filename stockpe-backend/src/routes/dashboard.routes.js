const express = require("express");
const { getDashboardFeed, getDashboardContest } = require("../controllers/dashboard.controller");

const router = express.Router();

// Phase 1 is intentionally public and read-only. It has no participation,
// wallet, payment, or settlement endpoints.
router.get("/", getDashboardFeed);
router.get("/contests/:publicId", getDashboardContest);

module.exports = router;
