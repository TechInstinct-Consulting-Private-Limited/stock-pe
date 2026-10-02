const {
    ensureMockDepositAddress,
    getPaymentSummary,
    processMockWebhook,
    simulateMockDeposit,
    simulateMockWithdrawal,
} = require("../services/wallet-payments.service");

async function getSummary(req, res, next) {
    try {
        const summary = await getPaymentSummary({ userId: req.auth.sub });
        res.set("Cache-Control", "no-store");
        return res.status(200).json({ success: true, ...summary });
    } catch (error) {
        return next(error);
    }
}

async function createMockDepositAddress(req, res, next) {
    try {
        const depositAddress = await ensureMockDepositAddress({ userId: req.auth.sub });
        return res.status(201).json({ success: true, depositAddress });
    } catch (error) {
        return next(error);
    }
}

async function createMockDeposit(req, res, next) {
    try {
        const result = await simulateMockDeposit({
            userId: req.auth.sub,
            amountUsdt: req.body?.amountUsdt,
        });
        return res.status(201).json({ success: true, ...result });
    } catch (error) {
        return next(error);
    }
}

async function createMockWithdrawal(req, res, next) {
    try {
        const result = await simulateMockWithdrawal({
            userId: req.auth.sub,
            amountUsdt: req.body?.amountUsdt,
            idempotencyKey: req.body?.idempotencyKey,
        });
        return res.status(201).json({ success: true, ...result });
    } catch (error) {
        return next(error);
    }
}

async function receiveMockWebhook(req, res, next) {
    try {
        const result = await processMockWebhook({
            payload: req.body,
            signature: req.get("x-mock-trc20-signature"),
        });
        return res.status(200).json({ success: true, ...result });
    } catch (error) {
        return next(error);
    }
}

module.exports = {
    createMockDeposit,
    createMockDepositAddress,
    createMockWithdrawal,
    getSummary,
    receiveMockWebhook,
};
