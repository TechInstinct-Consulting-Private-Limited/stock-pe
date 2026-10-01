const appConfig = require("./app.json");

const config = appConfig.expo;
const isReviewBuild = process.env.STOCKPE_REVIEW_BUILD === "true";
const easProjectId = "6a8c5f98-6246-469a-9c78-c636426926c9";
const reviewApiUrl = isReviewBuild
  ? "https://13.126.195.235.nip.io/api"
  : undefined;

module.exports = {
  expo: {
    ...config,
    extra: {
      ...config.extra,
      eas: { projectId: easProjectId },
      ...(reviewApiUrl ? { apiBaseUrl: reviewApiUrl } : {}),
    },
    updates: {
      ...config.updates,
      url: `https://u.expo.dev/${easProjectId}`,
    },
    android: {
      ...config.android,
    },
  },
};
