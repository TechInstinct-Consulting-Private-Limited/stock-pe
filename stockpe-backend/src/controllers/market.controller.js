const marketService = require("../services/market.service");

async function getIndices(req, res, next) {
  try {
    const force = req.query.refresh === "true";
    const data = await marketService.getLiveIndices(force);
    return res.status(200).json({
      success: true,
      data: data.indices,
      meta: {
        cached: data.cached,
        stale: !!data.stale,
        lastUpdated: data.lastUpdated,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function searchContestInstruments(req, res, next) {
  try {
    const query = String(req.query.q || "").trim();
    if (query.length < 2) {
      return res.status(400).json({ success: false, message: "q must contain at least 2 characters" });
    }

    const instruments = await marketService.searchContestInstruments(query);
    return res.status(200).json({
      success: true,
      data: instruments,
      meta: {
        scope: "demo-contest-supported-indices",
        count: instruments.length,
      },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getIndices,
  searchContestInstruments,
};
