const { getDemoCreditBalance, getMyDemoContests, joinDemoContest } = require("../services/demo-contest.service");
async function join(req, res, next) { try { res.status(201).json({ success: true, ...(await joinDemoContest({ userId: req.auth.sub, publicId: req.params.publicId, predictionValue: req.body.predictionValue })) }); } catch (error) { next(error); } }
async function balance(req, res, next) {
    try {
        res.set("Cache-Control", "no-store");
        res.status(200).json({ success: true, ...(await getDemoCreditBalance({ userId: req.auth.sub })) });
    } catch (error) {
        next(error);
    }
}
async function mine(req, res, next) {
    try {
        res.set("Cache-Control", "no-store");
        res.status(200).json({
            success: true,
            ...(await getMyDemoContests({ userId: req.auth.sub, status: req.query.status })),
        });
    } catch (error) {
        next(error);
    }
}
module.exports = { balance, join, mine };
