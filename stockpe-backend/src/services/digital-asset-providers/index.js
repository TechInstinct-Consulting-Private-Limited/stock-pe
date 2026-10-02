const { createUnconfiguredProvider } = require("./unconfigured.provider");
const { createMockTrc20Provider } = require("./mock-trc20.provider");

function createDigitalAssetProvider({ providerKey = process.env.DIGITAL_ASSET_PROVIDER } = {}) {
    // Provider adapters are intentionally not activated by an environment value
    // alone. A reviewed adapter, sandbox credentials, and webhook secret are
    // mandatory before this registry can return a live provider.
    if (!providerKey || providerKey === "unconfigured") {
        return createUnconfiguredProvider();
    }

    if (providerKey === "mock-trc20") {
        if (process.env.NODE_ENV === "production" || process.env.MOCK_TRC20_ENABLED !== "true") {
            const error = new Error(
                "Mock TRC20 payments are available only in an explicitly enabled non-production environment"
            );
            error.statusCode = 503;
            error.isOperational = true;
            throw error;
        }

        return createMockTrc20Provider({
            webhookSecret: process.env.MOCK_TRC20_WEBHOOK_SECRET,
        });
    }

    const error = new Error(
        `Digital asset provider \"${providerKey}\" is not installed or approved`
    );
    error.statusCode = 503;
    error.isOperational = true;
    throw error;
}

module.exports = { createDigitalAssetProvider };
