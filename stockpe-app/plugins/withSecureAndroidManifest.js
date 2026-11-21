const {
  AndroidConfig,
  withAndroidManifest,
} = require("@expo/config-plugins");

const BROWSER_PROXY_ACTIVITY = "expo.modules.webbrowser.BrowserProxyActivity";
const PROFILE_INSTALLER_RECEIVER = "androidx.profileinstaller.ProfileInstallReceiver";

function addToolsAttribute(component, value) {
  component.$ = component.$ || {};
  const existing = component.$["tools:remove"];
  const entries = new Set(
    String(existing || "")
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean),
  );
  entries.add(value);
  component.$["tools:remove"] = [...entries].join(",");
}

/**
 * Hardens manifest components inherited from Expo/AndroidX libraries without
 * changing MarketPe's user flows. The BrowserProxyActivity is used for the
 * DigiLocker/tutorial external browser handoff; it must remain present, but
 * must use the application's default task affinity. ProfileInstaller's
 * exported receiver is optional performance tooling and not needed at runtime.
 */
module.exports = function withSecureAndroidManifest(config) {
  if (process.env.MARKETPE_SECURE_BUILD !== "true") {
    return config;
  }

  return withAndroidManifest(config, (manifestConfig) => {
    const application = AndroidConfig.Manifest.getMainApplicationOrThrow(
      manifestConfig.modResults,
    );

    application.activity = application.activity || [];
    let browserActivity = application.activity.find(
      (activity) => activity.$?.["android:name"] === BROWSER_PROXY_ACTIVITY,
    );
    if (!browserActivity) {
      browserActivity = { $: { "android:name": BROWSER_PROXY_ACTIVITY } };
      application.activity.push(browserActivity);
    }
    addToolsAttribute(browserActivity, "android:taskAffinity");

    application.receiver = application.receiver || [];
    let profileInstaller = application.receiver.find(
      (receiver) => receiver.$?.["android:name"] === PROFILE_INSTALLER_RECEIVER,
    );
    if (!profileInstaller) {
      profileInstaller = { $: { "android:name": PROFILE_INSTALLER_RECEIVER } };
      application.receiver.push(profileInstaller);
    }
    profileInstaller.$["tools:node"] = "remove";

    return manifestConfig;
  });
};
