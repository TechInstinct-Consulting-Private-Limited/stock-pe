import Constants from "expo-constants";
import {
    getAuthToken,
    getDeviceId,
    getRefreshToken,
    setAuthSession,
} from "./authStorage";

function resolveApiBaseUrl() {
    const configuredUrl = Constants.expoConfig?.extra?.apiBaseUrl?.replace(/\/$/, "");

    // A release build only trusts the value baked into its Expo configuration.
    // This prevents a developer's local EXPO_PUBLIC_API_URL from changing a
    // release build to HTTP during bundling.
    if (!__DEV__) {
        if (!configuredUrl || !configuredUrl.startsWith("https://")) {
            throw new Error(
                "A secure HTTPS API URL is required for release builds.",
            );
        }

        return configuredUrl;
    }

    // Local HTTP remains possible only when a developer explicitly supplies it
    // through EXPO_PUBLIC_API_URL. We deliberately do not ship localhost or
    // emulator HTTP fallbacks in the production JavaScript bundle.
    if (!configuredUrl) {
        throw new Error(
            "Set EXPO_PUBLIC_API_URL before starting a development build.",
        );
    }

    return configuredUrl;
}

const API_BASE_URL = resolveApiBaseUrl();

export function getApiBaseUrl() {
    return API_BASE_URL;
}

class ApiError extends Error {}

export function getUserFacingError(
    error,
    fallback = "Something went wrong. Please try again.",
) {
    return error instanceof ApiError ? error.message : fallback;
}

async function request(path, options = {}) {
    let response;

    try {
        response = await fetch(`${API_BASE_URL}${path}`, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                ...options.headers,
            },
        });
    } catch (_error) {
        throw new ApiError(
            "Unable to connect. Check your internet connection and try again.",
        );
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new ApiError(data.message || "Request failed. Please try again.");
    }

    return data;
}

export function signUp(mobile, password) {
    return request("/auth/signup", {
        method: "POST",
        body: JSON.stringify({ mobile, password }),
    });
}

export function signIn(mobile, password) {
    return request("/auth/signin", {
        method: "POST",
        body: JSON.stringify({ mobile, password }),
    });
}

export function verifyOtp(mobile, otp, purpose) {
    return request("/auth/verify-otp", {
        method: "POST",
        body: JSON.stringify({ mobile, otp, purpose }),
    });
}

export function continueMobileAuth(mobile, deviceId) {
    return request("/auth/mobile/continue", {
        method: "POST",
        body: JSON.stringify({ mobile, deviceId }),
    });
}

export function authenticateWithMsg91(mobile, purpose, msg91Token) {
    return request("/auth/msg91-session", {
        method: "POST",
        body: JSON.stringify({ mobile, purpose, msg91Token }),
    });
}

export function setupMpin(deviceId, mpin) {
    return authenticatedRequest("/auth/mpin/setup", {
        method: "POST",
        body: JSON.stringify({ deviceId, mpin }),
    });
}

export function unlockWithMpin(deviceId, mpin, mobile) {
    return request("/auth/mpin/unlock", {
        method: "POST",
        body: JSON.stringify({ deviceId, mpin, mobile }),
    });
}

export async function refreshAuthSession() {
    const [deviceId, refreshToken] = await Promise.all([
        getDeviceId(),
        getRefreshToken(),
    ]);
    if (!deviceId || !refreshToken)
        throw new ApiError("Your session has expired. Please sign in again.");
    const session = await request("/auth/refresh", {
        method: "POST",
        body: JSON.stringify({ deviceId, refreshToken }),
    });
    await setAuthSession(session);
    return session;
}

export async function logoutCurrentDevice() {
    const deviceId = await getDeviceId();
    if (!deviceId) return;
    return authenticatedRequest("/auth/device/logout", {
        method: "POST",
        body: JSON.stringify({ deviceId }),
    });
}

export function prepareMsg91Otp(mobile, purpose) {
    return request("/auth/msg91/start", {
        method: "POST",
        body: JSON.stringify({ mobile, purpose }),
    });
}

export function verifyMsg91Otp(reqId, otp) {
    return request("/auth/msg91/verify", {
        method: "POST",
        body: JSON.stringify({ reqId, otp }),
    });
}

export function retryMsg91Otp(reqId, retryChannel) {
    return request("/auth/msg91/retry", {
        method: "POST",
        body: JSON.stringify({ reqId, retryChannel }),
    });
}

export function resendOtp(mobile, purpose) {
    return request("/auth/resend-otp", {
        method: "POST",
        body: JSON.stringify({ mobile, purpose }),
    });
}

async function authenticatedRequest(path, options = {}) {
    const token = await getAuthToken();

    if (!token) {
        throw new ApiError("Your session has expired. Please sign in again.");
    }

    try {
        return await request(path, {
            ...options,
            headers: { ...options.headers, Authorization: `Bearer ${token}` },
        });
    } catch (error) {
        if (
            !(error instanceof ApiError) ||
            !/session|token|auth/i.test(error.message)
        )
            throw error;
        const refreshed = await refreshAuthSession();
        return request(path, {
            ...options,
            headers: {
                ...options.headers,
                Authorization: `Bearer ${refreshed.token}`,
            },
        });
    }
}

export function getAadhaarKycStatus() {
    return authenticatedRequest("/kyc/aadhaar/status");
}

export function initiateDigiLockerKyc() {
    return authenticatedRequest("/kyc/digilocker/initiate", { method: "POST" });
}

export function getDigiLockerKycStatus(verificationId) {
    return authenticatedRequest(
        `/kyc/digilocker/${encodeURIComponent(verificationId)}/status`,
    );
}

export function getDigiLockerSessionStatus(sessionId) {
    return authenticatedRequest(
        `/kyc/digilocker/session/${encodeURIComponent(sessionId)}/status`,
    );
}

export function getDemoDashboard(status = "ALL") {
    return request(`/dashboard?status=${encodeURIComponent(status)}`, {
        headers: { "Cache-Control": "no-store" },
    });
}

export function getDemoContest(publicId) {
    return request(`/dashboard/contests/${encodeURIComponent(publicId)}`, {
        headers: { "Cache-Control": "no-store" },
    });
}

export function getMyDemoContests(status = "ALL") {
    return authenticatedRequest(
        `/demo-contests/mine?status=${encodeURIComponent(status)}`,
        {
            headers: { "Cache-Control": "no-store" },
        },
    );
}

export function getDemoCreditBalance() {
    return authenticatedRequest("/demo-contests/balance", {
        headers: { "Cache-Control": "no-store" },
    });
}

export function getDemoUsdtWallet() {
    return authenticatedRequest("/demo-contests/demo-usdt-wallet", {
        headers: { "Cache-Control": "no-store" },
    });
}

export function getLeaderboard(instrument = "ALL") {
    return authenticatedRequest(
        `/leaders?instrument=${encodeURIComponent(instrument)}`,
        {
            headers: { "Cache-Control": "no-store" },
        },
    );
}

export function getContestLeaderboard(publicId) {
    return authenticatedRequest(
        `/leaders?contest=${encodeURIComponent(publicId)}`,
        {
            headers: { "Cache-Control": "no-store" },
        },
    );
}

export function getLeaderProfile(userId) {
    return authenticatedRequest(`/leaders/${encodeURIComponent(userId)}`, {
        headers: { "Cache-Control": "no-store" },
    });
}

export function joinDemoContest(publicId, predictionValue) {
    return authenticatedRequest(
        `/demo-contests/${encodeURIComponent(publicId)}/join`,
        {
            method: "POST",
            body: JSON.stringify(
                predictionValue === undefined ? {} : { predictionValue },
            ),
        },
    );
}

export function getUsdtWallet() {
    return authenticatedRequest("/wallet/usdt");
}

export function getOnboardingStatus() {
    return authenticatedRequest("/onboarding/status", {
        headers: { "Cache-Control": "no-store" },
    });
}

export function linkUsdtWallet(network, address) {
    return authenticatedRequest("/wallet/usdt", {
        method: "POST",
        body: JSON.stringify({ network, address }),
    });
}

export function getWalletPaymentSummary() {
    return authenticatedRequest("/wallet/payments/summary", {
        headers: { "Cache-Control": "no-store" },
    });
}

export function createMockDepositAddress() {
    return authenticatedRequest("/wallet/payments/mock/deposit-address", {
        method: "POST",
    });
}

export function simulateMockDeposit(amountUsdt) {
    return authenticatedRequest("/wallet/payments/mock/deposits", {
        method: "POST",
        body: JSON.stringify({ amountUsdt }),
    });
}

export function simulateMockWithdrawal(amountUsdt, idempotencyKey) {
    return authenticatedRequest("/wallet/payments/mock/withdrawals", {
        method: "POST",
        body: JSON.stringify({ amountUsdt, idempotencyKey }),
    });
}

export function getLiveIndices(refresh = false) {
    const query = refresh ? "?refresh=true" : "";
    return request(`/market/indices${query}`);
}

export function getProfileMe() {
    return authenticatedRequest("/profile/me", {
        headers: { "Cache-Control": "no-store" },
    });
}

export function getProfilePredictions(status = "ALL") {
    return authenticatedRequest(
        `/profile/predictions?status=${encodeURIComponent(status)}`,
        { headers: { "Cache-Control": "no-store" } },
    );
}

export function getProfileWinnings() {
    return authenticatedRequest("/profile/winnings", {
        headers: { "Cache-Control": "no-store" },
    });
}

export function getProfileDemoPayouts() {
    return authenticatedRequest("/profile/demo-payouts", {
        headers: { "Cache-Control": "no-store" },
    });
}

export function getProfileNotifications() {
    return authenticatedRequest("/profile/notifications", {
        headers: { "Cache-Control": "no-store" },
    });
}

export function getProfileTutorials() {
    return authenticatedRequest("/profile/tutorials", {
        headers: { "Cache-Control": "no-store" },
    });
}

export function getNotificationPreferences() {
    return authenticatedRequest("/profile/notifications/preferences", {
        headers: { "Cache-Control": "no-store" },
    });
}

export function updateNotificationPreferences(payload) {
    return authenticatedRequest("/profile/notifications/preferences", {
        method: "PUT",
        body: JSON.stringify(payload),
    });
}

export function registerExpoPushToken(token, platform) {
    return authenticatedRequest("/profile/notifications/push-token", {
        method: "POST",
        body: JSON.stringify({ token, platform }),
    });
}

export function markProfileNotificationRead(notificationId) {
    return authenticatedRequest(
        `/profile/notifications/${encodeURIComponent(notificationId)}/read`,
        { method: "PATCH" },
    );
}

export function markAllProfileNotificationsRead() {
    return authenticatedRequest("/profile/notifications/read-all", {
        method: "PATCH",
    });
}
