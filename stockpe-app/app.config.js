const appConfig = require("./app.json");

const config = appConfig.expo;
const isReviewBuild = process.env.STOCKPE_REVIEW_BUILD === "true";

// Resolve the EAS project ID from env or the EAS-managed app.json value.
// Intentionally no hardcoded fallback: when unset, `eas init` is free to
// create/link a new project under whichever account you're logged in as.
const easProjectId =
  process.env.EAS_PROJECT_ID || config.extra?.eas?.projectId || undefined;

const reviewApiUrl = isReviewBuild
  ? "https://13.126.195.235.nip.io/api"
  : undefined;

module.exports = {
  expo: {
    ...config,
    extra: {
      ...config.extra,
      ...(easProjectId ? { eas: { projectId: easProjectId } } : {}),
      ...(reviewApiUrl ? { apiBaseUrl: reviewApiUrl } : {}),
    },
    updates: {
      ...config.updates,
      ...(easProjectId ? { url: `https://u.expo.dev/${easProjectId}` } : {}),
    },
    android: {
      ...config.android,
    },
  },
};
