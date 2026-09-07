const assert = require("node:assert/strict");
const test = require("node:test");

const {
    mobileIpKey,
    mobileOrIpKey,
} = require("../src/middleware/authRateLimitKey");

test("OTP rate-limit keys isolate valid mobile numbers", () => {
    const first = mobileOrIpKey({ body: { mobile: "9876543210" }, ip: "127.0.0.1" });
    const second = mobileOrIpKey({ body: { mobile: "9876543211" }, ip: "127.0.0.1" });

    assert.equal(first, "mobile:9876543210");
    assert.equal(second, "mobile:9876543211");
    assert.notEqual(first, second);
});

test("invalid mobile input falls back to a network key", () => {
    const key = mobileOrIpKey({ body: { mobile: "invalid" }, ip: "127.0.0.1" });

    assert.equal(key, "ip:127.0.0.1");
});

test("combined keys isolate both the mobile number and network", () => {
    const firstNetwork = mobileIpKey({
        body: { mobile: "9876543210" },
        ip: "192.0.2.1",
    });
    const secondNetwork = mobileIpKey({
        body: { mobile: "9876543210" },
        ip: "192.0.2.2",
    });
    const secondMobile = mobileIpKey({
        body: { mobile: "9876543211" },
        ip: "192.0.2.1",
    });

    assert.equal(firstNetwork, "mobile:9876543210:ip:192.0.2.1");
    assert.notEqual(firstNetwork, secondNetwork);
    assert.notEqual(firstNetwork, secondMobile);
});
