const express = require("express");
const rateLimit = require("express-rate-limit");
const {
    getStatus,
    requestOtp,
    verifyOtp,
} = require("../controllers/kyc.controller");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

const kycLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many KYC attempts. Please try again later.",
    },
});

router.use(requireAuth);
router.get("/aadhaar/status", getStatus);
router.post("/aadhaar/request-otp", kycLimiter, requestOtp);
router.post("/aadhaar/verify-otp", kycLimiter, verifyOtp);

module.exports = router;
