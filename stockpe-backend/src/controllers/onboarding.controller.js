const { getOnboardingStatus } = require("../services/onboarding.service");

async function getStatus(req, res, next) {
    try {
        const status = await getOnboardingStatus({ userId: req.auth.sub });
        res.set("Cache-Control", "no-store");
        return res.status(200).json({ success: true, ...status });
    } catch (error) {
        return next(error);
    }
}

module.exports = { getStatus };
