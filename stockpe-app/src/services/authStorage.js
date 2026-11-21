import * as SecureStore from "expo-secure-store";
import * as Crypto from "expo-crypto";
import { Platform } from "react-native";

const AUTH_TOKEN_KEY = "stockpe_auth_token";
const REFRESH_TOKEN_KEY = "marketpe_refresh_token";
const BIOMETRIC_REFRESH_TOKEN_KEY = "marketpe_biometric_refresh_token";
const DEVICE_ID_KEY = "marketpe_device_id";
const BIOMETRIC_ENABLED_KEY = "marketpe_biometric_enabled";
const LAST_ACTIVE_MOBILE_KEY = "marketpe_last_active_mobile";
const PENDING_MSG91_PASSWORD_KEY = "stockpe_pending_msg91_password";
const PENDING_MSG91_PASSWORD_TTL_MS = 15 * 60 * 1000;

export async function setAuthToken(token) {
    if (Platform.OS === "web") {
        globalThis.localStorage?.setItem(AUTH_TOKEN_KEY, token);
        return;
    }

    await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
}

async function getItem(key) {
    return Platform.OS === "web"
        ? globalThis.localStorage?.getItem(key) ?? null
        : SecureStore.getItemAsync(key);
}

async function setItem(key, value) {
    if (Platform.OS === "web") {
        globalThis.localStorage?.setItem(key, value);
        return;
    }
    await SecureStore.setItemAsync(key, value);
}

async function removeItem(key) {
    if (Platform.OS === "web") {
        globalThis.localStorage?.removeItem(key);
        return;
    }
    await SecureStore.deleteItemAsync(key);
}

export async function setAuthSession(
    { token, refreshToken, mobile, user },
    { biometricEnabled = false } = {},
) {
    if (token) await setAuthToken(token);
    if (refreshToken) {
        if (biometricEnabled && Platform.OS !== "web") {
            // This value is encrypted by the platform Keystore/Keychain and can
            // only be read after the operating system authenticates the user.
            await SecureStore.setItemAsync(BIOMETRIC_REFRESH_TOKEN_KEY, refreshToken, {
                requireAuthentication: true,
                authenticationPrompt: "Unlock MarketPe",
            });
            await removeItem(REFRESH_TOKEN_KEY);
        } else {
            await setItem(REFRESH_TOKEN_KEY, refreshToken);
            await removeItem(BIOMETRIC_REFRESH_TOKEN_KEY);
        }
    }
    const resolvedMobile = String(mobile || user?.mobile || "").replace(/\D/g, "").slice(-10);
    if (/^\d{10}$/.test(resolvedMobile)) await setItem(LAST_ACTIVE_MOBILE_KEY, resolvedMobile);
}

export async function setLastActiveMobile(mobile) {
    const cleanMobile = String(mobile || "").replace(/\D/g, "").slice(-10);
    if (/^\d{10}$/.test(cleanMobile)) await setItem(LAST_ACTIVE_MOBILE_KEY, cleanMobile);
}

export async function getLastActiveMobile() {
    const mobile = await getItem(LAST_ACTIVE_MOBILE_KEY);
    return /^\d{10}$/.test(String(mobile || "")) ? mobile : null;
}

export async function getRefreshToken() {
    return getItem(REFRESH_TOKEN_KEY);
}

export async function getBiometricRefreshToken() {
    if (Platform.OS === "web") return null;

    return SecureStore.getItemAsync(BIOMETRIC_REFRESH_TOKEN_KEY, {
        requireAuthentication: true,
        authenticationPrompt: "Unlock MarketPe",
    });
}

export async function canUseBiometricUnlock() {
    if (Platform.OS === "web") return false;

    return SecureStore.canUseBiometricAuthentication();
}

export async function getDeviceId() {
    return getItem(DEVICE_ID_KEY);
}

export async function ensureDeviceId() {
    const existing = await getDeviceId();
    if (existing) return existing;
    const id = `mp_${Crypto.randomUUID()}`;
    await setItem(DEVICE_ID_KEY, id);
    return id;
}

export async function setBiometricEnabled(enabled) {
    if (enabled) return setItem(BIOMETRIC_ENABLED_KEY, "1");
    return removeItem(BIOMETRIC_ENABLED_KEY);
}

export async function getBiometricEnabled() {
    return (await getItem(BIOMETRIC_ENABLED_KEY)) === "1";
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

export async function clearAuthSession({ keepDeviceId = true } = {}) {
    await removeAuthToken();
    await removeItem(REFRESH_TOKEN_KEY);
    await removeItem(BIOMETRIC_REFRESH_TOKEN_KEY);
    await removeItem(BIOMETRIC_ENABLED_KEY);
    if (!keepDeviceId) await removeItem(DEVICE_ID_KEY);
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
