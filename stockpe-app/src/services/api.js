import Constants from "expo-constants";
import { Platform } from "react-native";

// Mock auth is disabled by default so the app connects to the real backend APIs
const USE_MOCK_AUTH = process.env.EXPO_PUBLIC_USE_MOCK === "true";

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
    if (USE_MOCK_AUTH) {
        // Simulated network delay
        await new Promise((r) => setTimeout(r, 400));
        return { success: true, message: "Mock response successful" };
    }

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
        throw new Error("Unable to connect to backend server. Please verify the server is running.");
    }

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(data.message || "Request failed. Please try again.");
    }
    return data;
}

export async function signUp(mobile, password) {
    if (USE_MOCK_AUTH) {
        await new Promise((r) => setTimeout(r, 300));
        return {
            success: true,
            mobile,
            message: "OTP sent to registered mobile",
        };
    }
    return request("/auth/signup", {
        method: "POST",
        body: JSON.stringify({ mobile, password }),
    });
}

export async function signIn(mobile, password) {
    if (USE_MOCK_AUTH) {
        await new Promise((r) => setTimeout(r, 300));
        return {
            success: true,
            mobile,
            message: "OTP sent to registered mobile",
        };
    }
    return request("/auth/signin", {
        method: "POST",
        body: JSON.stringify({ mobile, password }),
    });
}

export async function verifyOtp(mobile, otp, purpose) {
    if (USE_MOCK_AUTH) {
        await new Promise((r) => setTimeout(r, 400));
        return {
            success: true,
            token: `stockpe_mock_token_${Date.now()}_${mobile}`,
            user: {
                mobile,
                name: "Arjun Kumar",
                kycVerified: true,
            },
        };
    }
    return request("/auth/verify-otp", {
        method: "POST",
        body: JSON.stringify({ mobile, otp, purpose }),
    });
}

export async function resendOtp(mobile, purpose) {
    if (USE_MOCK_AUTH) {
        await new Promise((r) => setTimeout(r, 300));
        return { success: true, message: "OTP resent successfully" };
    }
    return request("/auth/resend-otp", {
        method: "POST",
        body: JSON.stringify({ mobile, purpose }),
    });
}

export async function requestAadhaarOtp(aadhaarNumber, isMock = true) {
    await new Promise((r) => setTimeout(r, 400));
    return {
        success: true,
        verificationId: `v_aadhaar_${Date.now()}`,
        lastFour: String(aadhaarNumber).slice(-4) || "8921",
        message: "Aadhaar OTP sent successfully",
    };
}

export async function verifyAadhaarOtp(verificationId, otp) {
    await new Promise((r) => setTimeout(r, 400));
    return {
        success: true,
        status: "verified",
        name: "Arjun Kumar",
        aadhaarLastFour: "8921",
    };
}

export async function verifyAadhaarSecureQr(qrPayload) {
    await new Promise((r) => setTimeout(r, 300));
    return {
        success: true,
        status: "verified",
        name: "Arjun Kumar",
        aadhaarLastFour: "8921",
    };
}

export async function getAadhaarKycStatus() {
    return {
        status: "not_verified",
        aadhaarLastFour: "8921",
    };
}

export async function linkUsdtWallet(network, address) {
    await new Promise((r) => setTimeout(r, 400));
    return {
        success: true,
        network,
        address,
        message: "USDT Wallet linked successfully",
    };
}

export function getUserFacingError(error) {
    if (!error) return "An unexpected error occurred.";
    if (typeof error === "string") return error;
    return error.message || "An unexpected error occurred.";
}

