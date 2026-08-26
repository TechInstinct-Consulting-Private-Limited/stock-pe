const express = require("express");
const rateLimit = require("express-rate-limit");
const {
    resendOtp,
    signIn,
    signUp,
    verifyOtp,
} = require("../controllers/auth.controller");

const router = express.Router();

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many attempts. Please try again later.",
    },
});

router.post("/signup", authLimiter, signUp);
router.post("/signin", authLimiter, signIn);
router.post("/verify-otp", authLimiter, verifyOtp);
router.post("/resend-otp", authLimiter, resendOtp);

module.exports = router;
