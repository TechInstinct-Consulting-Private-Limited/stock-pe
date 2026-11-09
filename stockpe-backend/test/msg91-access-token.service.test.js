const test = require("node:test");
const assert = require("node:assert/strict");
const {
    MSG91_VERIFY_ACCESS_TOKEN_URL,
    Msg91AccessTokenService,
} = require("../src/services/msg91-access-token.service");

function response(status, body) {
    return {
        ok: status >= 200 && status < 300,
        status,
        text: async () => JSON.stringify(body),
    };
}

test("confirms an MSG91 token only when its verified mobile matches the account", async () => {
    let request;
    const service = new Msg91AccessTokenService({
        env: { MSG91_AUTH_KEY: "test-key" },
        fetchImpl: async (url, options) => {
            request = { url, options };
            return response(200, { type: "success", message: "919960929067" });
        },
    });

    const result = await service.verify({ accessToken: "verified-widget-token", expectedMobile: "9960929067" });

    assert.equal(result.verifiedMobile, "9960929067");
    assert.equal(request.url, MSG91_VERIFY_ACCESS_TOKEN_URL);
    assert.deepEqual(JSON.parse(request.options.body), {
        authkey: "test-key",
        "access-token": "verified-widget-token",
    });
});

test("rejects a valid MSG91 token for a different mobile number", async () => {
    const service = new Msg91AccessTokenService({
        env: { MSG91_AUTH_KEY: "test-key" },
        fetchImpl: async () => response(200, { type: "success", message: "919970708070" }),
    });

    await assert.rejects(
        service.verify({ accessToken: "verified-widget-token", expectedMobile: "9960929067" }),
        { statusCode: 401, message: "The verified mobile number does not match this account." }
    );
});

test("rejects MSG91 error payloads even when MSG91 responds with HTTP 200", async () => {
    const service = new Msg91AccessTokenService({
        env: { MSG91_AUTH_KEY: "test-key" },
        fetchImpl: async () => response(200, { type: "error", message: "AuthenticationFailure", code: "201" }),
    });

    await assert.rejects(
        service.verify({ accessToken: "invalid-token", expectedMobile: "9960929067" }),
        { statusCode: 401, message: "Mobile verification could not be confirmed. Please request a new OTP." }
    );
});
