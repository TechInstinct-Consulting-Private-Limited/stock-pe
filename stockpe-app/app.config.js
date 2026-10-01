const appConfig = require("./app.json");

const config = appConfig.expo;
const isReviewBuild = process.env.STOCKPE_REVIEW_BUILD === "true";
const easProjectId = "6a8c5f98-6246-469a-9c78-c636426926c9";

module.exports = {
  expo: {
    ...config,
    extra: {
      ...config.extra,
      eas: { projectId: easProjectId },
    },
    updates: {
      ...config.updates,
      url: `https://u.expo.dev/${easProjectId}`,
    },
    android: {
      ...config.android,
      // The current staging API is HTTP-only. This is deliberately limited
      // to internal review builds; production keeps Android's HTTPS default.
      ...(isReviewBuild ? { usesCleartextTraffic: true } : {}),
    },
  },
};
