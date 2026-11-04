const test = require("node:test");
const assert = require("node:assert/strict");
const SandboxDigiLockerProvider = require("../src/services/aadhaar-kyc/providers/sandbox-digilocker.provider");

function jsonResponse(body, { ok = true, status = 200 } = {}) {
    return {
        ok,
        status,
        text: async () => JSON.stringify(body),
    };
}

test("Sandbox DigiLocker provider creates a consent session and reads only the verified profile fields", async () => {
    const requests = [];
    const provider = new SandboxDigiLockerProvider({
        env: {
            SANDBOX_API_KEY: "test-key",
            SANDBOX_API_SECRET: "test-secret",
            SANDBOX_BASE_URL: "https://sandbox.example",
            DIGILOCKER_REQUESTOR_NAME: "MarketPe",
        },
        fetchImpl: async (url, options) => {
            requests.push({ url, options });
            if (url.endsWith("/authenticate")) {
                return jsonResponse({ code: 200, data: { access_token: "access-token", expires_in: 3600 } });
            }
            if (url.endsWith("/sessions/init")) {
                return jsonResponse({
                    code: 200,
                    data: { session_id: "session-123", authorization_url: "https://digilocker.example/consent" },
                });
            }
            if (url.endsWith("/status")) {
                return jsonResponse({ code: 200, data: { status: "succeeded", documents_consented: ["aadhaar"] } });
            }
            return jsonResponse({
                code: 200,
                data: {
                    name: "Test User",
                    date_of_birth: "1990-01-01",
                    address: "Must not leave the provider boundary",
                },
            });
        },
    });

    const session = await provider.initiateSession({ redirectUrl: "https://staging.example/kyc/return" });
    const status = await provider.getSessionStatus({ sessionId: session.sessionId });
    const profile = await provider.getUserProfile({ sessionId: session.sessionId });

    assert.equal(session.accepted, true);
    assert.equal(session.sessionId, "session-123");
    assert.deepEqual(status, { accepted: true, status: "succeeded", documentsConsented: ["aadhaar"] });
    assert.deepEqual(profile.kycData, { fullName: "Test User", dateOfBirth: "1990-01-01", isMock: false });
    assert.equal(requests.length, 4);
    assert.equal(requests[1].options.headers.Authorization, "access-token");
    assert.equal(JSON.parse(requests[1].options.body).redirect_url, "https://staging.example/kyc/return");
});
