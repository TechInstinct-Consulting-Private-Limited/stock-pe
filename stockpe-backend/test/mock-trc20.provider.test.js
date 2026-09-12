const test = require("node:test");
const assert = require("node:assert/strict");
const {
    createMockTrc20Provider,
} = require("../src/services/digital-asset-providers/mock-trc20.provider");

test("mock TRC20 provider emits a signed deposit event", async () => {
    const provider = createMockTrc20Provider({ webhookSecret: "test-secret" });
    const simulated = await provider.simulateDeposit({
        address: "mock-trc20-user-1-address",
        amountUsdt: "12.500000",
    });

    assert.equal(simulated.event.payload.type, "deposit.confirmed");
    assert.equal(simulated.event.payload.network, "TRC20");
    assert.equal(
        provider.verifyWebhook({
            payload: simulated.event.payload,
            signature: simulated.event.signature,
        }),
        true
    );
});

test("mock TRC20 provider rejects tampered webhook payloads", async () => {
    const provider = createMockTrc20Provider({ webhookSecret: "test-secret" });
    const simulated = await provider.simulateDeposit({
        address: "mock-trc20-user-1-address",
        amountUsdt: "12.500000",
    });

    simulated.event.payload.data.amountUsdt = "99.000000";
    assert.equal(
        provider.verifyWebhook({
            payload: simulated.event.payload,
            signature: simulated.event.signature,
        }),
        false
    );
});
