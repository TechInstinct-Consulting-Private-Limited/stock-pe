import { authenticateWithMsg91, getOnboardingStatus } from "./api";
import { setAuthSession } from "./authStorage";
import { registerCurrentDeviceForPush } from "./pushNotifications";

export async function completeMsg91Authentication({ mobile, mode, accessToken }) {
    const authData = await authenticateWithMsg91(
        String(mobile),
        mode === "signup" ? "signup" : "signin",
        accessToken,
    );

    if (!authData?.token) {
        throw new Error("Could not create your secure session. Please try again.");
    }

    await setAuthSession({ ...authData, mobile });
    registerCurrentDeviceForPush().catch(() => {});

    return getOnboardingStatus();
}

export function getPostAuthenticationRoute({ onboarding, mobile, mode }) {
    const params = {
        mobile: String(mobile || ""),
        mode: mode === "signup" ? "signup" : "signin",
    };

    if (onboarding?.onboardingCompleted) {
        return { pathname: "/(tabs)/events", params: { tab: "OPEN" } };
    }

    if (onboarding?.aadhaarKyc?.completed) {
        return { pathname: "/usdt-wallet", params: { ...params, verified: "1" } };
    }

    return { pathname: "/digilocker-kyc", params };
}
