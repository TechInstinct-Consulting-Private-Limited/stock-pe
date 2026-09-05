const crypto = require("crypto");

const MOCK_OTP = "123456";
const OTP_EXPIRY_SECONDS = 10 * 60;

class MockAadhaarKycProvider {
    constructor({ env = process.env } = {}) {
        if (env.NODE_ENV === "production") {
            throw new Error("The mock Aadhaar KYC provider cannot be used in production");
        }

        this.name = "mock";
    }

    async requestOtp({ aadhaarNumber }) {
        if (!/^9999\d{8}$/.test(aadhaarNumber)) {
            return {
                accepted: false,
                reason: "MOCK_AADHAAR_REQUIRED",
            };
        }

        const transactionId = crypto.randomUUID();
        console.log(`[DEV AADHAAR OTP] transaction ${transactionId}: ${MOCK_OTP}`);

        return {
            accepted: true,
            transactionId,
            expiresInSeconds: OTP_EXPIRY_SECONDS,
        };
    }

    async verifyOtp({ otp }) {
        if (otp !== MOCK_OTP) {
            return {
                verified: false,
                reason: "INVALID_OTP",
            };
        }

        return {
            verified: true,
            kycData: {
                fullName: "DEVELOPMENT USER",
                dateOfBirth: "1990-01-01",
                gender: "U",
                address: {
                    district: "Test District",
                    state: "Test State",
                    postalCode: "000000",
                },
                isMock: true,
            },
        };
    }
}

module.exports = MockAadhaarKycProvider;
