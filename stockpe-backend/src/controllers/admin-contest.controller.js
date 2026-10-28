const service = require("../services/admin-contest.service");
const payouts = require("../services/demo-contest-test-payout.service");
const users = require("../services/admin-user.service");
const notifications = require("../services/admin-notification.service");

function respond(handler) {
    return async (req, res, next) => {
        try { return res.status(200).json({ success: true, ...(await handler(req)) }); }
        catch (error) { return next(error); }
    };
}

const list = respond(async (req) => ({ contests: await service.listContests({ status: req.query.status }) }));
const details = respond(async (req) => ({ ...(await service.getContestDetails(req.params.publicId)) }));
const entries = respond(async (req) => ({ entries: await service.getContestEntries(req.params.publicId) }));
const create = respond(async (req) => ({ contest: await service.createContest({ adminUserId: req.admin.userId, input: req.body }) }));
const createBulkSchedule = respond(async (req) => ({ schedule: await service.createBulkScheduledContests({ adminUserId: req.admin.userId, input: req.body || {} }) }));
const update = respond(async (req) => ({ contest: await service.updateContest({ adminUserId: req.admin.userId, publicId: req.params.publicId, input: req.body }) }));
const changeStatus = respond(async (req) => ({ contest: await service.changeContestStatus({ adminUserId: req.admin.userId, publicId: req.params.publicId, ...req.body }) }));
const settle = respond(async (req) => ({ contest: await service.settleContest({ adminUserId: req.admin.userId, publicId: req.params.publicId, ...req.body }) }));
const listPayouts = respond(async (req) => ({ payouts: await payouts.listTestPayouts({ status: req.query.status }) }));
const listUsers = respond(async (req) => ({ users: await users.listUsers({ query: req.query.query }) }));
const listWallets = respond(async (req) => ({ wallets: await users.listWalletDirectory({ query: req.query.query }) }));
const userOverview = respond(async (req) => ({ ...(await users.getUserOverview(req.params.userId)) }));
const userWallet = respond(async (req) => ({ ...(await users.getUserWallet(req.params.userId)) }));
const userContests = respond(async (req) => ({ contests: await users.getUserContests(req.params.userId) }));
const userKyc = respond(async (req) => ({ verifications: await users.getUserKyc(req.params.userId) }));
const userNotifications = respond(async (req) => ({ notifications: await users.getUserNotifications(req.params.userId) }));
const userActivity = respond(async (req) => ({ activity: await users.getUserActivity(req.params.userId) }));
const createPayout = respond(async (req) => ({ payout: await payouts.createTestPayout({ adminUserId: req.admin.userId, publicId: req.params.publicId, entryId: req.body?.entryId, amountUsdt: req.body?.amountUsdt, note: req.body?.note }) }));
const approvePayout = respond(async (req) => ({ payout: await payouts.approveTestPayout({ adminUserId: req.admin.userId, payoutId: req.params.payoutId, note: req.body?.note }) }));
const completePayout = respond(async (req) => ({ payout: await payouts.completeTestPayout({ adminUserId: req.admin.userId, payoutId: req.params.payoutId, note: req.body?.note }) }));
const rejectPayout = respond(async (req) => ({ payout: await payouts.rejectTestPayout({ adminUserId: req.admin.userId, payoutId: req.params.payoutId, note: req.body?.note }) }));
const listNotifications = respond(async (req) => ({ notifications: await notifications.listNotifications(req.query) }));
const notificationMetrics = respond(async () => ({ metrics: await notifications.getMetrics() }));
const notificationTemplates = respond(async () => ({ templates: await notifications.listTemplates() }));
const createNotificationCampaign = respond(async (req) => ({ campaign: await notifications.createCampaign({ adminUserId: req.admin.userId, input: req.body || {} }) }));

module.exports = { approvePayout, changeStatus, completePayout, create, createBulkSchedule, createNotificationCampaign, createPayout, details, entries, list, listNotifications, listPayouts, listUsers, listWallets, notificationMetrics, notificationTemplates, rejectPayout, settle, update, userActivity, userContests, userKyc, userNotifications, userOverview, userWallet };
