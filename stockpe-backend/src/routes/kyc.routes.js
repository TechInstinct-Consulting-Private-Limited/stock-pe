const express = require("express");
const rateLimit = require("express-rate-limit");
const {
    getStatus,
    initiateDigiLocker,
    requestOtp,
    refreshDigiLocker,
    refreshDigiLockerBySession,
    verifyOtp,
} = require("../controllers/kyc.controller");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// DigiLocker redirects the browser here after consent. Only its opaque session
// id is forwarded to the app; the app must still make an authenticated status
// request before treating KYC as verified.
router.get("/digilocker/return", (req, res) => {
    const sessionId = String(req.query.session_id || "");
    if (/^[0-9a-f-]{36}$/i.test(sessionId)) {
        return res.redirect(302, `stockpeapp:///digilocker-kyc?callback=1&sessionId=${encodeURIComponent(sessionId)}`);
    }

    res.status(200).type("html").send(`<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Return to StockPe</title></head>
<body style="font-family:system-ui,-apple-system,sans-serif;background:#f8fafc;color:#0f172a;margin:0;padding:32px;text-align:center">
<main style="max-width:440px;margin:64px auto;background:#fff;border:1px solid #e2e8f0;border-radius:18px;padding:28px">
<h1 style="font-size:22px;margin:0 0 12px">Return to StockPe</h1>
<p style="line-height:1.55;color:#475569;margin:0">This verification return link is incomplete. Close this page and return to the StockPe app to continue securely.</p>
</main></body></html>`);
});

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
router.post("/digilocker/initiate", kycLimiter, initiateDigiLocker);
router.get("/digilocker/:verificationId/status", kycLimiter, refreshDigiLocker);
router.get("/digilocker/session/:sessionId/status", kycLimiter, refreshDigiLockerBySession);
router.post("/aadhaar/request-otp", kycLimiter, requestOtp);
router.post("/aadhaar/verify-otp", kycLimiter, verifyOtp);

module.exports = router;
