const appConfig = require("./app.json");

const config = appConfig.expo;
const isReviewBuild = process.env.STOCKPE_REVIEW_BUILD === "true";
const isSecureBuild = process.env.MARKETPE_SECURE_BUILD === "true";
const easProjectId = "6a8c5f98-6246-469a-9c78-c636426926c9";
const reviewApiUrl = isReviewBuild ? "https://13.126.195.235.nip.io/api" : undefined;

module.exports = {
    expo: {
        ...config,
        plugins: [
            ...config.plugins.filter((plugin) => {
                const name = Array.isArray(plugin) ? plugin[0] : plugin;
                return name !== "expo-local-authentication";
            }),
            [
                "expo-build-properties",
                {
                    android: {
                        // Android 10 is the oldest supported release. This prevents
                        // installation on Android releases that no longer receive
                        // reasonable security updates.
                        minSdkVersion: 29,
                        // Local HTTP is still allowed only for local development.
                        // Preview and production artifacts must use HTTPS/WSS.
                        ...(isSecureBuild ? { usesCleartextTraffic: false } : {}),
                        ...(isSecureBuild
                            ? {
                                enableMinifyInReleaseBuilds: true,
                                enableShrinkResourcesInReleaseBuilds: true,
                                extraProguardRules: [
                                    "# Remove Android log calls from release bytecode.",
                                    "-assumenosideeffects class android.util.Log { *; }",
                                ].join("\\n"),
                            }
                            : {}),
                    },
                },
            ],
            "./plugins/withSecureExpoModules",
            "./plugins/withSecureAndroidManifest",
        ],
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
            // Never include market/account data in Android device backups.
            allowBackup: false,
            // These are inherited by Expo libraries but MarketPe does not use
            // external-storage reads/writes or overlay windows. Blocking them
            // reduces the release permission surface without affecting Aadhaar
            // QR camera scanning or opted-in push notifications.
            blockedPermissions: [
                ...(config.android?.blockedPermissions || []),
                "android.permission.READ_EXTERNAL_STORAGE",
                "android.permission.WRITE_EXTERNAL_STORAGE",
                "android.permission.SYSTEM_ALERT_WINDOW",
            ],
        },
    },
};
