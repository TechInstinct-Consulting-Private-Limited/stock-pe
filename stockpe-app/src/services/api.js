import Constants from "expo-constants";
import { Platform } from "react-native";
import { getAuthToken } from "./authStorage";

function resolveApiBaseUrl() {
    // 1. If running in Web browser
    if (Platform.OS === "web") {
        if (typeof window !== "undefined" && window.location) {
            const hostname = window.location.hostname;
            if (hostname === "localhost" || hostname === "127.0.0.1") {
                return "http://localhost:5000/api";
            }
        }
        if (process.env.EXPO_PUBLIC_API_URL) {
            return process.env.EXPO_PUBLIC_API_URL.replace(/\/$/, "");
        }
        return "http://localhost:5000/api";
    }

    // 2. If running on mobile via Expo Go, dynamically use the bundler host IP
    const hostUri = Constants.expoConfig?.hostUri || Constants.manifest?.debuggerHost || Constants.manifest2?.extra?.expoClient?.hostUri;
    const host = hostUri?.split(":")[0];

    if (host) {
        return `http://${host}:5000/api`;
    }

    if (process.env.EXPO_PUBLIC_API_URL) {
        return process.env.EXPO_PUBLIC_API_URL.replace(/\/$/, "");
    }

    if (Platform.OS === "android") {
        return "http://10.0.2.2:5000/api";
    }

    return "http://localhost:5000/api";
}

class ApiError extends Error { }

export function getUserFacingError(
    error,
    fallback = "Something went wrong. Please try again."
) {
    if (!error) return fallback;
    if (typeof error === "string") return error;
    return error.message || fallback;
}

async function request(path, options = {}) {
    const baseUrl = resolveApiBaseUrl();
    let response;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);

    try {
        console.log(`[API Request] ${options.method || "GET"} ${baseUrl}${path}`);
        response = await fetch(`${baseUrl}${path}`, {
            ...options,
            signal: controller.signal,
            headers: {
                "Content-Type": "application/json",
                ...options.headers,
            },
        });
    } catch (error) {
        if (error.name === "AbortError") {
            throw new ApiError(
                `Connection timed out connecting to ${baseUrl}. Check your server and network.`
            );
        }
        throw new ApiError(
            `Unable to connect to backend at ${baseUrl}. Ensure backend server is running.`
        );
    } finally {
        clearTimeout(timeoutId);
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

export function requestAadhaarOtp(aadhaarNumber, consent = true) {
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

export function verifyAadhaarSecureQr(payload, consent = true) {
    return authenticatedRequest("/kyc/aadhaar/verify-secure-qr", {
        method: "POST",
        body: JSON.stringify({ payload, consent }),
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
