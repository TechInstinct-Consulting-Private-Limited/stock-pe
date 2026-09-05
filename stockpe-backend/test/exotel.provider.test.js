const assert = require("node:assert/strict");
const test = require("node:test");

const ExotelOtpProvider = require(
    "../src/services/otp-delivery/providers/exotel.provider"
);

function createEnvironment(overrides = {}) {
    return {
        EXOTEL_API_KEY: "api-key",
        EXOTEL_API_TOKEN: "api-token",
        EXOTEL_ACCOUNT_SID: "account-sid",
        EXOTEL_SUBDOMAIN: "api.in.exotel.com",
        EXOTEL_SMS_FROM: "STOCKP",
        EXOTEL_DLT_ENTITY_ID: "entity-id",
        EXOTEL_DLT_TEMPLATE_ID: "template-id",
        EXOTEL_SMS_TEMPLATE:
            "Your StockPE verification code is {{otp}}. Do not share it. - StockPE",
        ...overrides,
    };
}

test("sends an OTP using Exotel without leaking provider details to callers", async () => {
    let capturedRequest;
    const provider = new ExotelOtpProvider({
        env: createEnvironment(),
        fetchImpl: async (url, options) => {
            capturedRequest = { url, options };
            return new Response(
                JSON.stringify({
                    SMSMessage: { Sid: "sms-123", Status: "queued" },
                }),
                { status: 200 }
            );
        },
    });

    const result = await provider.sendOtp({
        mobile: "9876543210",
        otp: "123456",
    });

    assert.deepEqual(result, { messageId: "sms-123", status: "queued" });
    assert.equal(
        capturedRequest.url,
        "https://api.in.exotel.com/v1/Accounts/account-sid/Sms/send"
    );
    assert.equal(
        capturedRequest.options.headers.Authorization,
        `Basic ${Buffer.from("api-key:api-token").toString("base64")}`
    );

    const requestBody = capturedRequest.options.body;
    assert.equal(requestBody.get("To"), "+919876543210");
    assert.equal(requestBody.get("From"), "STOCKP");
    assert.equal(requestBody.get("DltEntityId"), "entity-id");
    assert.equal(requestBody.get("DltTemplateId"), "template-id");
    assert.equal(requestBody.get("Priority"), "high");
    assert.equal(
        requestBody.get("Body"),
        "Your StockPE verification code is 123456. Do not share it. - StockPE"
    );
});

test("rejects incomplete Exotel configuration", () => {
    assert.throws(
        () =>
            new ExotelOtpProvider({
                env: createEnvironment({ EXOTEL_API_TOKEN: "" }),
                fetchImpl: async () => {},
            }),
        /Missing Exotel settings: EXOTEL_API_TOKEN/
    );
});

test("maps an Exotel rejection to a delivery error", async () => {
    const provider = new ExotelOtpProvider({
        env: createEnvironment(),
        fetchImpl: async () =>
            new Response(
                JSON.stringify({
                    RestException: { Message: "Template mismatch" },
                }),
                { status: 400 }
            ),
    });

    await assert.rejects(
        provider.sendOtp({ mobile: "9876543210", otp: "123456" }),
        (error) => {
            assert.equal(error.message, "Template mismatch");
            assert.equal(error.statusCode, 502);
            return true;
        }
    );
});
