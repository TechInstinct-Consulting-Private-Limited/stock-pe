const express = require("express");
const rateLimit = require("express-rate-limit");
const { getWallet, linkWallet } = require("../controllers/wallet.controller");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

const walletLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many wallet attempts. Please try again later.",
    },
});

router.use(requireAuth);
router.get("/usdt", getWallet);
router.post("/usdt", walletLimiter, linkWallet);

module.exports = router;
