const express = require("express");
const rateLimit = require("express-rate-limit");
const {
    getWallet,
    linkWallet,
    createDeposit,
    checkDepositStatus,
    handleIpnWebhook,
    getBalance,
    getTransactions,
} = require("../controllers/wallet.controller");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

const walletLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 30,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many wallet attempts. Please try again later.",
    },
});

// Public IPN Webhook route (authenticated via HMAC signature header x-nowpayments-sig)
router.post("/deposit/webhook", handleIpnWebhook);

// Protected routes (require user session)
router.use(requireAuth);
router.get("/balance", getBalance);
router.get("/transactions", getTransactions);
router.get("/usdt", getWallet);
router.post("/usdt", walletLimiter, linkWallet);
router.post("/deposit/create", walletLimiter, createDeposit);
router.get("/deposit/status/:paymentId", checkDepositStatus);

module.exports = router;
