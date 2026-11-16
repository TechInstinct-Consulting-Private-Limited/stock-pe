const service = require("../services/admin-access.service");

function respond(handler) {
    return async (req, res, next) => {
        try {
            return res.status(200).json({ success: true, ...(await handler(req)) });
        } catch (error) {
            return next(error);
        }
    };
}

const list = respond(async () => ({ administrators: await service.listAdminAccess() }));
const grant = respond(async (req) => ({ administrator: await service.grantAdminAccess(req.body || {}) }));
const changeRole = respond(async (req) => ({
    administrator: await service.updateAdminRole({
        userId: req.params.userId,
        role: req.body?.role,
        actorUserId: req.admin.userId,
    }),
}));
const revoke = respond(async (req) => ({
    administrator: await service.revokeAdminAccess({
        userId: req.params.userId,
        actorUserId: req.admin.userId,
    }),
}));

module.exports = { changeRole, grant, list, revoke };
