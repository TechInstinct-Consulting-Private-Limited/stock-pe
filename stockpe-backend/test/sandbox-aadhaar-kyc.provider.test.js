const test = require("node:test");
const assert = require("node:assert/strict");
const SandboxCoInAadhaarKycProvider = require("../src/services/aadhaar-kyc/providers/sandbox-coin.provider");

function jsonResponse(body, { ok = true, status = 200 } = {}) {
    return {
        ok,
        status,
        text: async () => JSON.stringify(body),
    };
}

test("Sandbox Aadhaar provider requests and verifies an OTP without logging identity data", async () => {
    const requests = [];
    const provider = new SandboxCoInAadhaarKycProvider({
        env: {
            SANDBOX_API_KEY: "test-key",
            SANDBOX_API_SECRET: "test-secret",
            SANDBOX_BASE_URL: "https://sandbox.example",
        },
        fetchImpl: async (url, options) => {
            requests.push({ url, options });
            if (url.endsWith("/authenticate")) {
                return jsonResponse({ code: 200, data: { access_token: "access-token", expires_in: 3600 } });
            }
            if (url.endsWith("/otp")) {
                return jsonResponse({ code: 200, data: { reference_id: 12345 } });
            }
            return jsonResponse({
                code: 200,
                data: {
                    status: "VALID",
                    name: "Test User",
                    date_of_birth: "1990-01-01",
                    full_address: "Must not leave the provider boundary",
                    photo: "Must not leave the provider boundary",
                },
            });
        },
    });

    const otpResult = await provider.requestOtp({ aadhaarNumber: "123456789012" });
    const verificationResult = await provider.verifyOtp({ transactionId: otpResult.transactionId, otp: "123456" });

    assert.equal(otpResult.accepted, true);
    assert.equal(otpResult.transactionId, "12345");
    assert.deepEqual(verificationResult.kycData, {
        fullName: "Test User",
        dateOfBirth: "1990-01-01",
        isMock: false,
    });
    assert.equal(requests.length, 3);
    assert.equal(requests[1].options.headers.Authorization, "access-token");
});
