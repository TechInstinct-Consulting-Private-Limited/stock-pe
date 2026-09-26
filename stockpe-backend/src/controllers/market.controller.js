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

module.exports = {
  getIndices,
};
