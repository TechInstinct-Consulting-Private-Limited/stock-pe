const assert = require("node:assert/strict");
const test = require("node:test");

const { createAadhaarKycProvider } = require(
    "../src/services/aadhaar-kyc"
);

test("selects the mock provider using only AADHAAR_KYC_PROVIDER", async () => {
    const provider = createAadhaarKycProvider({
        env: { NODE_ENV: "development" },
        providerName: "mock",
    });

    const request = await provider.requestOtp({
        aadhaarNumber: "999999999999",
    });
    const verification = await provider.verifyOtp({
        transactionId: request.transactionId,
        otp: "123456",
    });

    assert.equal(request.accepted, true);
    assert.equal(request.expiresInSeconds, 600);
    assert.equal(verification.verified, true);
    assert.equal(verification.kycData.isMock, true);
});

test("accepts any 12-digit Aadhaar number in mock mode", async () => {
    const provider = createAadhaarKycProvider({
        env: { NODE_ENV: "development" },
        providerName: "mock",
    });

    const result = await provider.requestOtp({
        aadhaarNumber: "123456789012",
    });

    assert.equal(result.accepted, true);
    assert.equal(typeof result.transactionId, "string");
});

test("blocks the mock provider in production", () => {
    assert.throws(
        () =>
            createAadhaarKycProvider({
                env: { NODE_ENV: "production" },
                providerName: "mock",
            }),
        /cannot be used in production/
    );
});
