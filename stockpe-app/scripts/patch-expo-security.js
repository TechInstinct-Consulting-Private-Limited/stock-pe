const fs = require("fs");
const path = require("path");

const expoRoot = path.dirname(
    require.resolve("expo/package.json")
);

const sourcePath = path.join(
    expoRoot,
    "src/async-require/fetchThenEvalJs.ts"
);

const original = fs.readFileSync(sourcePath, "utf8");

const signature =
    "export function fetchThenEvalAsync(url: string): Promise<void> {";

const guard = `
  if (!__DEV__) {
    return Promise.reject(
      new Error('Remote JavaScript loading is disabled in release builds.')
    );
  }
`;

if (original.includes(guard.trim())) {
    console.log("[Security] Expo patch already applied.");
} else {
    if (!original.includes(signature)) {
        throw new Error(
            "[Security] Unsupported Expo source. Manual review required."
        );
    }

    const patched = original.replace(
        signature,
        signature + "\n" + guard
    );

    fs.writeFileSync(sourcePath, patched, "utf8");

    console.log("[Security] Expo remote JavaScript guard applied.");
}