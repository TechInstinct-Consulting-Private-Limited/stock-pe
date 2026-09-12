import Constants from "expo-constants";
import { Platform } from "react-native";
import { getAuthToken } from "./authStorage";

function resolveApiBaseUrl() {
    const hostUri = Constants.expoConfig?.hostUri;
    const host = hostUri?.split(":")[0];
    const configuredUrl = process.env.EXPO_PUBLIC_API_URL?.replace(
        /\/$/,
        ""
    );

    if (configuredUrl) {
        const usesLoopbackHost = /^https?:\/\/(localhost|127\.0\.0\.1)(?=[:/])/.test(
            configuredUrl
        );

        if (Platform.OS !== "web" && usesLoopbackHost && host) {
            return configuredUrl.replace(
                /^(https?:\/\/)(localhost|127\.0\.0\.1)/,
                `$1${host}`
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
    fallback = "Something went wrong. Please try again."
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
            "Unable to connect. Check your internet connection and try again."
        );
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new ApiError(
            data.message || "Request failed. Please try again."
        );
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

export function getAadhaarKycStatus() {
    return authenticatedRequest("/kyc/aadhaar/status");
}

export function getUsdtWallet() {
    return authenticatedRequest("/wallet/usdt");
}

export function linkUsdtWallet(network, address) {
    return authenticatedRequest("/wallet/usdt", {
        method: "POST",
        body: JSON.stringify({ network, address }),
    });
}
