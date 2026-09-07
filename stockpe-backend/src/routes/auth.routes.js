const express = require("express");
const { rateLimit } = require("express-rate-limit");
const { mobileOrIpKey } = require("../middleware/authRateLimitKey");
const {
    resendOtp,
    signIn,
    signUp,
    verifyOtp,
} = require("../controllers/auth.controller");

const router = express.Router();

const authIpLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 500,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many requests from this network. Please try again later.",
    },
});

const otpRequestLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    keyGenerator: mobileOrIpKey,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many OTP requests for this mobile number. Please try again later.",
    },
});

const otpVerificationLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    keyGenerator: mobileOrIpKey,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many OTP verification attempts. Please request a new OTP later.",
    },
});

router.use(authIpLimiter);
router.post("/signup", otpRequestLimiter, signUp);
router.post("/signin", otpRequestLimiter, signIn);
router.post("/verify-otp", otpVerificationLimiter, verifyOtp);
router.post("/resend-otp", otpRequestLimiter, resendOtp);

module.exports = router;
