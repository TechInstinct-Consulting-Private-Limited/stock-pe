function providerNotConfigured() {
    const error = new Error(
        "Real USDT transactions are not enabled. Configure an approved custody provider first."
    );
    error.statusCode = 503;
    error.isOperational = true;
    return error;
}

function createUnconfiguredProvider() {
    return {
        key: "unconfigured",
        network: "TRC20",
        async createDepositAddress() {
            throw providerNotConfigured();
        },
        async getTransaction() {
            throw providerNotConfigured();
        },
        async createWithdrawal() {
            throw providerNotConfigured();
        },
        async verifyWebhook() {
            throw providerNotConfigured();
        },
    };
}

module.exports = { createUnconfiguredProvider };
