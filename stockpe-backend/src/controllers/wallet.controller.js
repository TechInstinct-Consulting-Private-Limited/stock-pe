const {
    getUsdtWallet,
    linkUsdtWallet,
    createCryptoDeposit,
    getDepositStatus,
    processIpnWebhook,
    getUserWalletBalance,
    getUserTransactions,
} = require("../services/wallet.service");

async function getWallet(req, res, next) {
    try {
        const result = await getUsdtWallet({ userId: req.auth.sub });
        return res.status(200).json({ success: true, ...result });
    } catch (error) {
        return next(error);
    }
}

async function linkWallet(req, res, next) {
    try {
        const { network, address } = req.body;
        const result = await linkUsdtWallet({
            userId: req.auth.sub,
            network,
            address,
        });

        return res.status(200).json({
            success: true,
            message: "USDT wallet linked successfully",
            ...result,
        });
    } catch (error) {
        return next(error);
    }
}

async function createDeposit(req, res, next) {
    try {
        const { amount, network, couponCode, callbackUrl } = req.body;
        const result = await createCryptoDeposit({
            userId: req.auth.sub,
            amountUsd: amount,
            network: network || "TRC20",
            couponCode,
            callbackUrl,
        });

        return res.status(201).json({
            success: true,
            message: "Crypto deposit initiated",
            data: result,
        });
    } catch (error) {
        return next(error);
    }
}

async function checkDepositStatus(req, res, next) {
    try {
        const { paymentId } = req.params;
        const result = await getDepositStatus({
            userId: req.auth.sub,
            paymentId,
        });

        return res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        return next(error);
    }
}

async function handleIpnWebhook(req, res, next) {
    try {
        const signature = req.headers["x-nowpayments-sig"];
        const result = await processIpnWebhook(req.body, signature);
        return res.status(200).json({ success: true, ...result });
    } catch (error) {
        return next(error);
    }
}

async function getBalance(req, res, next) {
    try {
        const result = await getUserWalletBalance({ userId: req.auth.sub });
        return res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        return next(error);
    }
}

async function getTransactions(req, res, next) {
    try {
        const limit = Number(req.query.limit) || 20;
        const result = await getUserTransactions({
            userId: req.auth.sub,
            limit,
        });

        return res.status(200).json({
            success: true,
            data: result.transactions,
        });
    } catch (error) {
        return next(error);
    }
}

module.exports = {
    getWallet,
    linkWallet,
    createDeposit,
    checkDepositStatus,
    handleIpnWebhook,
    getBalance,
    getTransactions,
};
