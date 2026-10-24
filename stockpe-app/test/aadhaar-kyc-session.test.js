import test from "node:test";
import assert from "node:assert/strict";

import {
    clearPendingAadhaarNumber,
    getPendingAadhaarNumber,
    setPendingAadhaarNumber,
} from "../src/services/aadhaarKycSession.js";

test("keeps a valid Aadhaar number in memory for an OTP resend", () => {
    setPendingAadhaarNumber("1234 5678 9012");

    assert.equal(getPendingAadhaarNumber(), "123456789012");

    clearPendingAadhaarNumber();
});

test("does not retain an incomplete Aadhaar number", () => {
    setPendingAadhaarNumber("1234");

    assert.equal(getPendingAadhaarNumber(), "");
});

test("clears the temporary Aadhaar number after KYC completes", () => {
    setPendingAadhaarNumber("123456789012");
    clearPendingAadhaarNumber();

    assert.equal(getPendingAadhaarNumber(), "");
});
