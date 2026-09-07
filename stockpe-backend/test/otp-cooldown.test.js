const assert = require("node:assert/strict");
const test = require("node:test");

const {
    remainingOtpCooldownSeconds,
} = require("../src/services/otpCooldown");

test("reports the actual whole seconds remaining in the OTP cooldown", () => {
    const now = Date.parse("2026-09-07T12:00:30.250Z");
    const createdAt = new Date("2026-09-07T12:00:00.000Z");

    assert.equal(remainingOtpCooldownSeconds(createdAt, now), 30);
});

test("rounds partial remaining seconds up", () => {
    const now = Date.parse("2026-09-07T12:00:23.100Z");
    const createdAt = new Date("2026-09-07T12:00:00.000Z");

    assert.equal(remainingOtpCooldownSeconds(createdAt, now), 37);
});
