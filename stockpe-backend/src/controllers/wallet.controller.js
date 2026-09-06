const {
    getUsdtWallet,
    linkUsdtWallet,
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

module.exports = { getWallet, linkWallet };
