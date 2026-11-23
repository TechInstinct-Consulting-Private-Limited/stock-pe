const { withAndroidManifest } = require("expo/config-plugins");

const withDisableAndroidBackup = (config) => {
    return withAndroidManifest(config, (config) => {
        const application = config.modResults.manifest.application?.[0];

        if (!application) {
            throw new Error("Android application manifest not found");
        }

        application.$["android:allowBackup"] = "false";

        return config;
    });
};

module.exports = withDisableAndroidBackup;
