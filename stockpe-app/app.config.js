const appConfig = require("./app.json");

const config = appConfig.expo;
const isReviewBuild = process.env.STOCKPE_REVIEW_BUILD === "true";

module.exports = {
  expo: {
    ...config,
    android: {
      ...config.android,
      // The current staging API is HTTP-only. This is deliberately limited
      // to internal review builds; production keeps Android's HTTPS default.
      ...(isReviewBuild ? { usesCleartextTraffic: true } : {}),
    },
  },
};
