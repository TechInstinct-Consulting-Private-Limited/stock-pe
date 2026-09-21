const service = require("../services/admin-contest.service");

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

module.exports = { changeStatus, create, entries, list, settle, update };
