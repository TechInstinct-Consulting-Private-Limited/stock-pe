const crypto = require("crypto");

const PROVIDER_KEY = "mock-trc20";
const NETWORK = "TRC20";

function publicError(statusCode, message) {
    const error = new Error(message);
    error.statusCode = statusCode;
    error.isOperational = true;
    return error;
}

function signPayload(payload, webhookSecret) {
    return `sha256=${crypto
        .createHmac("sha256", webhookSecret)
        .update(JSON.stringify(payload))
        .digest("hex")}`;
}

function signaturesMatch(actual, expected) {
    const actualBuffer = Buffer.from(String(actual || ""));
    const expectedBuffer = Buffer.from(expected);

    return actualBuffer.length === expectedBuffer.length
        && crypto.timingSafeEqual(actualBuffer, expectedBuffer);
}

function createMockTrc20Provider({ webhookSecret } = {}) {
    if (!webhookSecret || webhookSecret.startsWith("replace_with_")) {
        throw publicError(
            503,
            "Mock TRC20 webhook secret is not configured"
        );
    }

    function createEvent(type, data) {
        const payload = {
            eventId: crypto.randomUUID(),
            type,
            network: NETWORK,
            occurredAt: new Date().toISOString(),
            data,
        };

        return {
            payload,
            signature: signPayload(payload, webhookSecret),
        };
    }

    return {
        key: PROVIDER_KEY,
        network: NETWORK,
        isMock: true,

        async createDepositAddress({ userId }) {
            // Intentionally not a valid TRON address: a test address must never
            // be mistaken for a real destination that can receive customer funds.
            return {
                providerAddressId: crypto.randomUUID(),
                address: `mock-trc20-${userId}-${crypto.randomUUID()}`,
            };
        },

        async simulateDeposit({ address, amountUsdt }) {
            const providerTransactionId = crypto.randomUUID();
            const txHash = `mock-tx-${crypto.randomUUID()}`;

            return {
                providerTransactionId,
                txHash,
                event: createEvent("deposit.confirmed", {
                    providerTransactionId,
                    txHash,
                    address,
                    amountUsdt: String(amountUsdt),
                    confirmations: 1,
                }),
            };
        },

        async createWithdrawal({ toAddress, amountUsdt, idempotencyKey }) {
            const providerTransferId = crypto.randomUUID();
            const txHash = `mock-withdrawal-${crypto.randomUUID()}`;

            return {
                providerTransferId,
                txHash,
                event: createEvent("withdrawal.completed", {
                    providerTransferId,
                    txHash,
                    toAddress,
                    amountUsdt: String(amountUsdt),
                    idempotencyKey,
                }),
            };
        },

        verifyWebhook({ payload, signature }) {
            return signaturesMatch(signature, signPayload(payload, webhookSecret));
        },
    };
}

module.exports = {
    PROVIDER_KEY,
    createMockTrc20Provider,
    signPayload,
};
