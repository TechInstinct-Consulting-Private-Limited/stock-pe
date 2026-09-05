const {
    getAadhaarKycStatus,
    requestAadhaarOtp,
    verifyAadhaarOtp,
} = require("../services/aadhaar-kyc.service");

const AADHAAR_PATTERN = /^\d{12}$/;
const OTP_PATTERN = /^\d{6}$/;
const UUID_PATTERN =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function validationError(res, message) {
    return res.status(400).json({ success: false, message });
}

async function requestOtp(req, res, next) {
    try {
        const { aadhaarNumber, consent } = req.body;

        if (!AADHAAR_PATTERN.test(aadhaarNumber)) {
            return validationError(res, "Aadhaar number must contain 12 digits");
        }

        if (consent !== true) {
            return validationError(res, "Explicit Aadhaar KYC consent is required");
        }

        const result = await requestAadhaarOtp({
            userId: req.auth.sub,
            aadhaarNumber,
        });

        return res.status(201).json({
            success: true,
            message: "Aadhaar OTP requested successfully",
            ...result,
        });
    } catch (error) {
        return next(error);
    }
}

async function verifyOtp(req, res, next) {
    try {
        const { verificationId, otp } = req.body;

        if (!UUID_PATTERN.test(verificationId) || !OTP_PATTERN.test(otp)) {
            return validationError(res, "Invalid Aadhaar OTP verification request");
        }

        const result = await verifyAadhaarOtp({
            userId: req.auth.sub,
            verificationId,
            otp,
        });

        return res.status(200).json({
            success: true,
            message: "Aadhaar KYC verified successfully",
            ...result,
        });
    } catch (error) {
        return next(error);
    }
}

async function getStatus(req, res, next) {
    try {
        const result = await getAadhaarKycStatus({ userId: req.auth.sub });
        return res.status(200).json({ success: true, ...result });
    } catch (error) {
        return next(error);
    }
}

module.exports = {
    getStatus,
    requestOtp,
    verifyOtp,
};
