const service = require("../services/profile.service");
const respond = (work) => async (req, res, next) => { try { res.json({ success: true, ...(await work(req)) }); } catch (error) { next(error); } };

module.exports = {
    me: respond(async (req) => ({ ...(await service.getMe(req.auth.sub)) })),
    predictions: respond(async (req) => ({ entries: await service.getPredictions(req.auth.sub, req.query.status) })),
    winnings: respond(async (req) => ({ ...(await service.getWinnings(req.auth.sub)) })),
    demoPayouts: respond(async (req) => ({ ...(await service.getDemoPayouts(req.auth.sub)) })),
    notifications: respond(async (req) => ({ notifications: await service.listNotifications(req.auth.sub) })),
    markRead: respond(async (req) => { await service.markNotificationRead(req.auth.sub, req.params.notificationId); return {}; }),
    markAllRead: respond(async (req) => { await service.markAllNotificationsRead(req.auth.sub); return {}; }),
    notificationPreferences: respond(async (req) => ({ preferences: await service.getNotificationPreferences(req.auth.sub) })),
    updateNotificationPreferences: respond(async (req) => ({ preferences: await service.updateNotificationPreferences(req.auth.sub, req.body) })),
    registerPushToken: respond(async (req) => { await service.registerPushToken(req.auth.sub, req.body?.token, req.body?.platform); return {}; }),
};
