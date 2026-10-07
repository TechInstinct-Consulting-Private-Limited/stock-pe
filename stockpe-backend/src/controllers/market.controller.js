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

async function searchMarket(req, res, next) {
  try {
    const { q } = req.query;
    const results = await marketService.searchMarket(q);
    return res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getIndices,
  searchMarket,
};

