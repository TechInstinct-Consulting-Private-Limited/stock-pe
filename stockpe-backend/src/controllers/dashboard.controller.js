const { getDashboard, getContestByPublicId } = require("../services/dashboard.service");

async function getDashboardFeed(req, res, next) {
    try {
        const dashboard = await getDashboard({ filter: req.query.status });
        res.set("Cache-Control", "no-store");
        return res.status(200).json({ success: true, ...dashboard });
    } catch (error) {
        return next(error);
    }
}

async function getDashboardContest(req, res, next) {
    try {
        const contest = await getContestByPublicId(req.params.publicId);
        res.set("Cache-Control", "no-store");
        return res.status(200).json({ success: true, environment: "demo", contest });
    } catch (error) {
        return next(error);
    }
}

module.exports = { getDashboardFeed, getDashboardContest };
