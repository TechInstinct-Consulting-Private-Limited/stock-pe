const express = require("express");
const { rateLimit } = require("express-rate-limit");
const {
    mobileIpKey,
    mobileOrIpKey,
} = require("../middleware/authRateLimitKey");
const {
    continueWithMobile,
    createMsg91Session,
    prepareMsg91Otp,
    verifyMsg91Otp,
    retryMsg91Otp,
    resendOtp,
    signIn,
    signUp,
    verifyOtp,
} = require("../controllers/auth.controller");
const { requireAuth } = require("../middleware/auth");
const { setupMpin, unlockWithMpin, refreshAuthSession, logoutCurrentDevice, revokeCurrentDevice } = require("../controllers/mpin.controller");
const { login: adminLogin } = require("../controllers/admin-auth.controller");

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

// Checking whether a device can use MPIN is not an OTP send. Keep this
// separately rate-limited so normal Continue taps never exhaust OTP quota.
const mobileContinueLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 30,
    keyGenerator: mobileOrIpKey,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many sign-in attempts. Please try again later.",
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

const mpinLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { success: false, message: "Too many MPIN attempts. Please try again later." },
});

router.use(authIpLimiter);
// Admin Console sign-in is intentionally separate from the mobile app's
// password/OTP/MPIN journey. It never sends an OTP.
router.post("/admin/login", mobileContinueLimiter, adminLogin);
router.post("/signup", otpRequestLimiter, otpRequestMobileIpLimiter, signUp);
router.post("/signin", otpRequestLimiter, otpRequestMobileIpLimiter, signIn);
router.post("/mobile/continue", mobileContinueLimiter, continueWithMobile);
router.post(
    "/verify-otp",
    otpVerificationLimiter,
    otpVerificationMobileIpLimiter,
    verifyOtp
);
router.post("/mpin/setup", requireAuth, setupMpin);
router.post("/mpin/unlock", mpinLimiter, unlockWithMpin);
router.post("/refresh", mpinLimiter, refreshAuthSession);
router.post("/device/logout", requireAuth, logoutCurrentDevice);
router.post("/device/revoke", requireAuth, revokeCurrentDevice);
router.post("/resend-otp", otpRequestLimiter, otpRequestMobileIpLimiter, resendOtp);
router.post("/msg91/start", otpRequestLimiter, otpRequestMobileIpLimiter, prepareMsg91Otp);
router.post("/msg91/verify", otpVerificationLimiter, otpVerificationMobileIpLimiter, verifyMsg91Otp);
router.post("/msg91/retry", otpRequestLimiter, otpRequestMobileIpLimiter, retryMsg91Otp);
router.post(
    "/msg91-session",
    otpVerificationLimiter,
    otpVerificationMobileIpLimiter,
    createMsg91Session
);

module.exports = router;
