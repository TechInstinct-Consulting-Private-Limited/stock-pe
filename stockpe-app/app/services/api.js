import Constants from "expo-constants";
import { Platform } from "react-native";

function resolveApiBaseUrl() {
    if (process.env.EXPO_PUBLIC_API_URL) {
        return process.env.EXPO_PUBLIC_API_URL.replace(/\/$/, "");
    }

    const hostUri = Constants.expoConfig?.hostUri;
    const host = hostUri?.split(":")[0];

    if (host) {
        return `http://${host}:5000/api`;
    }

    if (Platform.OS === "android") {
        return "http://10.0.2.2:5000/api";
    }

    return "http://localhost:5000/api";
}

const API_BASE_URL = resolveApiBaseUrl();

async function request(path, options = {}) {
    let response;

    try {
        response = await fetch(`${API_BASE_URL}${path}`, {
            headers: {
                "Content-Type": "application/json",
                ...options.headers,
            },
            ...options,
        });
    } catch (_error) {
        throw new Error(
            `Could not reach the server. Start the backend and check API URL: ${API_BASE_URL}`
        );
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.message || "Request failed. Please try again.");
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
