const express = require("express");
const rateLimit = require("express-rate-limit");
const { requireAuth } = require("../middleware/auth");
const {
    createMockDeposit,
    createMockDepositAddress,
    createMockWithdrawal,
    getSummary,
    receiveMockWebhook,
} = require("../controllers/wallet-payments.controller");

const router = express.Router();
const mockPaymentLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 30,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { success: false, message: "Too many mock payment attempts. Please try again later." },
});

// A real provider will use a separate provider-specific route with its own
// signature verifier. This endpoint only accepts explicitly enabled mock events.
router.post("/webhooks/mock-trc20", mockPaymentLimiter, receiveMockWebhook);

router.use(requireAuth);
router.get("/summary", getSummary);
router.post("/mock/deposit-address", mockPaymentLimiter, createMockDepositAddress);
router.post("/mock/deposits", mockPaymentLimiter, createMockDeposit);
router.post("/mock/withdrawals", mockPaymentLimiter, createMockWithdrawal);

module.exports = router;
