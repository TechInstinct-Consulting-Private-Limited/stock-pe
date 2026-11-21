const fs = require("fs");
const path = require("path");

/**
 * Expo's LogBox is a development error overlay. Expo SDK 57 ships a native
 * implementation that explicitly enables Chrome WebView debugging, even in
 * an Android release artifact. That creates an unnecessary release attack
 * surface and is reported as a High finding by MobSF.
 *
 * This config plugin runs only for our secure review/release builds and
 * removes that explicit opt-in. Android's default remains debugging disabled.
 * It deliberately does not alter development builds, where LogBox debugging
 * is useful to developers.
 */
module.exports = function withSecureExpoModules(config) {
  if (process.env.MARKETPE_SECURE_BUILD !== "true") {
    return config;
  }

  const logBoxWrapper = path.join(
    config._internal?.projectRoot || process.cwd(),
    "node_modules",
    "@expo",
    "log-box",
    "android",
    "src",
    "main",
    "expo",
    "modules",
    "logbox",
    "ExpoLogBoxWebViewWrapper.kt",
  );

  if (!fs.existsSync(logBoxWrapper)) {
    throw new Error(`Secure build could not find Expo LogBox source: ${logBoxWrapper}`);
  }

  const source = fs.readFileSync(logBoxWrapper, "utf8");
  const insecureCall = "    setWebContentsDebuggingEnabled(true)\n";

  const hasExecutableDebugCall = /^\s{4}setWebContentsDebuggingEnabled\(/m.test(source);

  if (source.includes(insecureCall)) {
    fs.writeFileSync(logBoxWrapper, source.replace(insecureCall, ""), "utf8");
  } else if (!hasExecutableDebugCall) {
    // The source was already hardened during this build process.
  } else {
    throw new Error("Expo LogBox source changed; refusing to apply an unsafe partial patch.");
  }

  return config;
};
