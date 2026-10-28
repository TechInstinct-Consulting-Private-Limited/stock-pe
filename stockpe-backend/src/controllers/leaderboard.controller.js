const { getLeaderProfile, listLeaderboard } = require("../services/leaderboard.service");

async function list(req, res, next) { try { res.set("Cache-Control", "no-store"); res.json({ success: true, ...(await listLeaderboard({ instrument: req.query.instrument, currentUserId: req.auth.sub })) }); } catch (error) { next(error); } }
async function profile(req, res, next) { try { res.set("Cache-Control", "no-store"); res.json({ success: true, ...(await getLeaderProfile({ userId: req.params.userId, currentUserId: req.auth.sub })) }); } catch (error) { next(error); } }
module.exports = { list, profile };
