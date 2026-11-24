const appConfig = require("./app.json");

const config = appConfig.expo;

const isReviewBuild =
    process.env.STOCKPE_REVIEW_BUILD === "true";

const allowCleartextDevelopmentTraffic =
    process.env.EAS_BUILD_PROFILE === "development" &&
    !isReviewBuild &&
    process.env.STOCKPE_ALLOW_CLEARTEXT_DEV === "true";

const reviewApiUrl = isReviewBuild
    ? "https://13.126.195.235.nip.io/api"
    : undefined;

const configuredApiUrl =
    reviewApiUrl || process.env.EXPO_PUBLIC_API_URL;

module.exports = {
    expo: {
        ...config,

        plugins: [
            ...config.plugins,
            ["./plugins/withDisableAndroidBackup", {
                allowCleartextDevelopmentTraffic,
            }],
        ],

        extra: {
            ...config.extra,
            ...(configuredApiUrl ? { apiBaseUrl: configuredApiUrl } : {}),
        },

        android: {
            ...config.android,
            blockedPermissions: [
                ...(config.android?.blockedPermissions ?? []),
                "android.permission.SYSTEM_ALERT_WINDOW",
                "android.permission.READ_EXTERNAL_STORAGE",
                "android.permission.WRITE_EXTERNAL_STORAGE",
                "android.permission.USE_BIOMETRIC",
                "android.permission.USE_FINGERPRINT",
            ],
        },
    },
};