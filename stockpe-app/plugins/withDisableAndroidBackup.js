const fs = require("fs");
const path = require("path");
const { withAndroidManifest, withDangerousMod } = require("expo/config-plugins");

const LOGBOX_DEBUG_CALL = "setWebContentsDebuggingEnabled(true)";
const LOGBOX_SECURE_CALL = "setWebContentsDebuggingEnabled(isDebuggable)";

function patchExpoLogBoxForReleaseBuilds() {
    const packageRoot = path.dirname(
        require.resolve("@expo/log-box/package.json"),
    );
    const sourcePath = path.join(
        packageRoot,
        "android/src/main/expo/modules/logbox/ExpoLogBoxWebViewWrapper.kt",
    );
    const source = fs.readFileSync(sourcePath, "utf8");

    if (source.includes(LOGBOX_SECURE_CALL)) {
        return;
    }

    if (!source.includes(LOGBOX_DEBUG_CALL)) {
        throw new Error(
            "Unsupported @expo/log-box source; refusing to apply the WebView security patch.",
        );
    }

    const patched = source
        .replace(
            "import android.app.Activity",
            "import android.app.Activity\nimport android.content.pm.ApplicationInfo",
        )
        .replace(
            LOGBOX_DEBUG_CALL,
            "val isDebuggable = (context.applicationInfo.flags and ApplicationInfo.FLAG_DEBUGGABLE) != 0\n    " +
                LOGBOX_SECURE_CALL,
        );

    fs.writeFileSync(sourcePath, patched, "utf8");
}

const withDisableAndroidBackup = (config, options = {}) => {
    config = withDangerousMod(config, ["android", async (config) => {
        // Expo SDK 57 ships an unconditional WebView debugging call in LogBox.
        // Apply this guarded patch on every prebuild/EAS build so it is
        // reproducible and never relies on an edited local node_modules folder.
        patchExpoLogBoxForReleaseBuilds();
        return config;
    }]);

    return withAndroidManifest(config, (config) => {
        const application = config.modResults.manifest.application?.[0];

        if (!application) {
            throw new Error("Android application manifest not found");
        }

        application.$["android:allowBackup"] = "false";
        // Android blocks HTTP at the platform level by default. A developer may
        // explicitly opt in only for a local development client through
        // STOCKPE_ALLOW_CLEARTEXT_DEV=true.
        application.$["android:usesCleartextTraffic"] =
            options.allowCleartextDevelopmentTraffic ? "true" : "false";

        return config;
    });
};

module.exports = withDisableAndroidBackup;
