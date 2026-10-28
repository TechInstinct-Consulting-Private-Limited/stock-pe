const test = require("node:test");
const assert = require("node:assert/strict");

process.env.DB_HOST = process.env.DB_HOST || "127.0.0.1";
process.env.DB_NAME = process.env.DB_NAME || "stockpe_test";
process.env.DB_USER = process.env.DB_USER || "stockpe_test";

const { createOtp, getReviewOtpSettings } = require("../src/services/otp.service");

test("review OTP can serve any tester only outside production with an explicit flag", () => {
    const env = {
        NODE_ENV: "staging",
        REVIEW_TEST_OTP: "123456",
        REVIEW_ALLOW_ALL_MOBILES: "true",
        REVIEW_SKIP_OTP_DELIVERY: "true",
    };

    assert.deepEqual(getReviewOtpSettings("9876543210", env), { otp: "123456", skipDelivery: true });
    assert.equal(createOtp("9876543210", env), "123456");
});

test("review OTP is disabled in production even when flags are present", () => {
    const env = {
        NODE_ENV: "production",
        REVIEW_TEST_OTP: "123456",
        REVIEW_ALLOW_ALL_MOBILES: "true",
        REVIEW_SKIP_OTP_DELIVERY: "true",
    };

    assert.equal(getReviewOtpSettings("9876543210", env), null);
    assert.notEqual(createOtp("9876543210", env), "123456");
});
