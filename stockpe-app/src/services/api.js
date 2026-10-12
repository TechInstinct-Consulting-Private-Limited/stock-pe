import Constants from "expo-constants";
import { Platform } from "react-native";
import { getAuthToken } from "./authStorage";

function resolveApiBaseUrl() {
    const configuredUrl = (
        process.env.EXPO_PUBLIC_API_URL ||
        Constants.expoConfig?.extra?.apiBaseUrl
    )?.replace(/\/$/, "");

    if (Platform.OS === "web") {
        return configuredUrl || "http://localhost:5000/api";
    }

    const hostUri = Constants.expoConfig?.hostUri;
    const host = hostUri?.split(":")[0];

    if (configuredUrl) {
        const usesLoopbackHost =
            /^https?:\/\/(localhost|127\.0\.0\.1)(?=[:/])/.test(configuredUrl);

        if (Platform.OS !== "web" && usesLoopbackHost && host) {
            return configuredUrl.replace(
                /^(https?:\/\/)(localhost|127\.0\.0\.1)/,
                `$1${host}`,
            );
        }

        return configuredUrl;
    }

    if (host) {
        return `http://${host}:5000/api`;
    }

    if (Platform.OS === "android") {
        return "http://10.0.2.2:5000/api";
    }

    return "http://localhost:5000/api";
}

const API_BASE_URL = resolveApiBaseUrl();

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

    return request(path, {
        ...options,
        headers: {
            ...options.headers,
            Authorization: `Bearer ${token}`,
        },
    });
}

export function requestAadhaarOtp(aadhaarNumber, consent) {
    return authenticatedRequest("/kyc/aadhaar/request-otp", {
        method: "POST",
        body: JSON.stringify({
            aadhaarNumber,
            consent,
        }),
    });
}

export function verifyAadhaarOtp(verificationId, otp) {
    return authenticatedRequest("/kyc/aadhaar/verify-otp", {
        method: "POST",
        body: JSON.stringify({ verificationId, otp }),
    });
}

export function verifyAadhaarSecureQr(payload, consent) {
    return authenticatedRequest("/kyc/aadhaar/verify-secure-qr", {
        method: "POST",
        body: JSON.stringify({ payload, consent }),
    });
}

export function getAadhaarKycStatus() {
    return authenticatedRequest("/kyc/aadhaar/status");
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
    return authenticatedRequest(`/demo-contests/mine?status=${encodeURIComponent(status)}`, {
        headers: { "Cache-Control": "no-store" },
    });
}

export function joinDemoContest(publicId, predictionValue) {
    return authenticatedRequest(`/demo-contests/${encodeURIComponent(publicId)}/join`, {
        method: "POST",
        body: JSON.stringify(predictionValue === undefined ? {} : { predictionValue }),
    });
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
    return authenticatedRequest("/profile/me", { headers: { "Cache-Control": "no-store" } });
}

export function getProfilePredictions(status = "ALL") {
    return authenticatedRequest(`/profile/predictions?status=${encodeURIComponent(status)}`, { headers: { "Cache-Control": "no-store" } });
}

export function getProfileWinnings() {
    return authenticatedRequest("/profile/winnings", { headers: { "Cache-Control": "no-store" } });
}

export function getProfileNotifications() {
    return authenticatedRequest("/profile/notifications", { headers: { "Cache-Control": "no-store" } });
}

export function markProfileNotificationRead(notificationId) {
    return authenticatedRequest(`/profile/notifications/${encodeURIComponent(notificationId)}/read`, { method: "PATCH" });
}

export function markAllProfileNotificationsRead() {
    return authenticatedRequest("/profile/notifications/read-all", { method: "PATCH" });
}
