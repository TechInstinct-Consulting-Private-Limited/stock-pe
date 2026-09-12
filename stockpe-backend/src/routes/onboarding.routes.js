const express = require("express");
const { getStatus } = require("../controllers/onboarding.controller");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.get("/status", requireAuth, getStatus);

module.exports = router;
