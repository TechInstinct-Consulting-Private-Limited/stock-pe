import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const AUTH_TOKEN_KEY = "stockpe_auth_token";
const PENDING_MSG91_PASSWORD_KEY = "stockpe_pending_msg91_password";
const PENDING_MSG91_PASSWORD_TTL_MS = 15 * 60 * 1000;

export async function setAuthToken(token) {
    if (Platform.OS === "web") {
        globalThis.localStorage?.setItem(AUTH_TOKEN_KEY, token);
        return;
    }

    await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
}

export async function getAuthToken() {
    if (Platform.OS === "web") {
        return globalThis.localStorage?.getItem(AUTH_TOKEN_KEY) ?? null;
    }

    return SecureStore.getItemAsync(AUTH_TOKEN_KEY);
}

export async function removeAuthToken() {
    if (Platform.OS === "web") {
        globalThis.localStorage?.removeItem(AUTH_TOKEN_KEY);
        return;
    }

    await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
}

// A password is kept only while the native MSG91 flow is waiting for OTP.
// It never travels in navigation parameters or is stored in regular app state.
export async function setPendingMsg91Password(password) {
    const payload = JSON.stringify({ password, createdAt: Date.now() });
    if (Platform.OS === "web") {
        globalThis.sessionStorage?.setItem(PENDING_MSG91_PASSWORD_KEY, payload);
        return;
    }

    await SecureStore.setItemAsync(PENDING_MSG91_PASSWORD_KEY, payload);
}

export async function getPendingMsg91Password() {
    const raw = Platform.OS === "web"
        ? globalThis.sessionStorage?.getItem(PENDING_MSG91_PASSWORD_KEY) ?? null
        : await SecureStore.getItemAsync(PENDING_MSG91_PASSWORD_KEY);

    if (!raw) return null;

    try {
        const pending = JSON.parse(raw);
        if (
            typeof pending?.password !== "string"
            || !Number.isFinite(pending?.createdAt)
            || Date.now() - pending.createdAt > PENDING_MSG91_PASSWORD_TTL_MS
        ) {
            await clearPendingMsg91Password();
            return null;
        }
        return pending.password;
    } catch (_error) {
        await clearPendingMsg91Password();
        return null;
    }
}

export async function clearPendingMsg91Password() {
    if (Platform.OS === "web") {
        globalThis.sessionStorage?.removeItem(PENDING_MSG91_PASSWORD_KEY);
        return;
    }

    await SecureStore.deleteItemAsync(PENDING_MSG91_PASSWORD_KEY);
}
