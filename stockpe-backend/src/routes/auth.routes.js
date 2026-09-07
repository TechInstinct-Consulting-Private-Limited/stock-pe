const express = require("express");
const { rateLimit } = require("express-rate-limit");
const {
    mobileIpKey,
    mobileOrIpKey,
} = require("../middleware/authRateLimitKey");
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

const otpRequestMobileIpLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    keyGenerator: mobileIpKey,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many OTP requests for this mobile number from this network. Please try again later.",
    },
});

const otpVerificationMobileIpLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    keyGenerator: mobileIpKey,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many OTP verification attempts for this mobile number from this network. Please try again later.",
    },
});

router.use(authIpLimiter);
router.post("/signup", otpRequestLimiter, otpRequestMobileIpLimiter, signUp);
router.post("/signin", otpRequestLimiter, otpRequestMobileIpLimiter, signIn);
router.post(
    "/verify-otp",
    otpVerificationLimiter,
    otpVerificationMobileIpLimiter,
    verifyOtp
);
router.post("/resend-otp", otpRequestLimiter, otpRequestMobileIpLimiter, resendOtp);

module.exports = router;
