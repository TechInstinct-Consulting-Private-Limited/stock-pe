import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const AUTH_TOKEN_KEY = "stockpe_auth_token";

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
