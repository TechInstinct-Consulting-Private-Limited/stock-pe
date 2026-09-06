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
