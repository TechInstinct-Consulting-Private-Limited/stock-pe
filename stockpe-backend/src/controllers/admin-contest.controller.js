const service = require("../services/admin-contest.service");
const payouts = require("../services/demo-contest-test-payout.service");

function respond(handler) {
    return async (req, res, next) => {
        try { return res.status(200).json({ success: true, ...(await handler(req)) }); }
        catch (error) { return next(error); }
    };
}

const list = respond(async (req) => ({ contests: await service.listContests({ status: req.query.status }) }));
const entries = respond(async (req) => ({ entries: await service.getContestEntries(req.params.publicId) }));
const create = respond(async (req) => ({ contest: await service.createContest({ adminUserId: req.admin.userId, input: req.body }) }));
const update = respond(async (req) => ({ contest: await service.updateContest({ adminUserId: req.admin.userId, publicId: req.params.publicId, input: req.body }) }));
const changeStatus = respond(async (req) => ({ contest: await service.changeContestStatus({ adminUserId: req.admin.userId, publicId: req.params.publicId, ...req.body }) }));
const settle = respond(async (req) => ({ contest: await service.settleContest({ adminUserId: req.admin.userId, publicId: req.params.publicId, ...req.body }) }));
const listPayouts = respond(async (req) => ({ payouts: await payouts.listTestPayouts({ status: req.query.status }) }));
const createPayout = respond(async (req) => ({ payout: await payouts.createTestPayout({ adminUserId: req.admin.userId, publicId: req.params.publicId, entryId: req.body?.entryId, amountUsdt: req.body?.amountUsdt, note: req.body?.note }) }));
const approvePayout = respond(async (req) => ({ payout: await payouts.approveTestPayout({ adminUserId: req.admin.userId, payoutId: req.params.payoutId, note: req.body?.note }) }));
const completePayout = respond(async (req) => ({ payout: await payouts.completeTestPayout({ adminUserId: req.admin.userId, payoutId: req.params.payoutId, note: req.body?.note }) }));
const rejectPayout = respond(async (req) => ({ payout: await payouts.rejectTestPayout({ adminUserId: req.admin.userId, payoutId: req.params.payoutId, note: req.body?.note }) }));

module.exports = { approvePayout, changeStatus, completePayout, create, createPayout, entries, list, listPayouts, rejectPayout, settle, update };
