const appConfig = require("./app.json");

const config = appConfig.expo;
const isReviewBuild = process.env.STOCKPE_REVIEW_BUILD === "true";

const reviewApiUrl = isReviewBuild
    ? "https://13.126.195.235.nip.io/api"
    : undefined;

module.exports = {
    expo: {
        ...config,

        plugins: [...config.plugins, "./plugins/withDisableAndroidBackup"],

        extra: {
            ...config.extra,
            ...(reviewApiUrl ? { apiBaseUrl: reviewApiUrl } : {}),
        },

        android: {
            ...config.android,
            blockedPermissions: [
                ...(config.android?.blockedPermissions ?? []),
                "android.permission.SYSTEM_ALERT_WINDOW",
                "android.permission.READ_EXTERNAL_STORAGE",
                "android.permission.WRITE_EXTERNAL_STORAGE",
            ],
        },
    },
};
