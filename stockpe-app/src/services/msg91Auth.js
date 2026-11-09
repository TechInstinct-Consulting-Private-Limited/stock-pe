import { authenticateWithMsg91, getOnboardingStatus } from "./api";
import { setAuthToken } from "./authStorage";
import { registerCurrentDeviceForPush } from "./pushNotifications";

export async function completeMsg91Authentication({ mobile, mode, password, accessToken }) {
    const authData = await authenticateWithMsg91(
        String(mobile),
        mode === "signup" ? "signup" : "signin",
        password,
        accessToken,
    );

    if (!authData?.token) {
        throw new Error("Could not create your secure session. Please try again.");
    }

    await setAuthToken(authData.token);
    registerCurrentDeviceForPush().catch(() => {});

    return getOnboardingStatus();
}

export function getPostAuthenticationRoute({ onboarding, mobile, mode }) {
    const params = {
        mobile: String(mobile || ""),
        mode: mode === "signup" ? "signup" : "signin",
    };

    if (onboarding?.onboardingCompleted) {
        return "/(tabs)/events";
    }

    if (onboarding?.aadhaarKyc?.completed) {
        return { pathname: "/usdt-wallet", params: { ...params, verified: "1" } };
    }

    return { pathname: "/digilocker-kyc", params };
}
