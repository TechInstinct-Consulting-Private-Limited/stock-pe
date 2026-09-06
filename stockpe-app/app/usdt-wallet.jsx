import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getUserFacingError, linkUsdtWallet } from "../src/services/api";

const NETWORKS = ["TRC20", "ERC20", "BEP20"];

const DEMO_ADDRESSES = {
    TRC20: "TQmBpVCoJmVfHhBnJ8oQ4nGsHwGgYbYtVA",
    ERC20: "0x9f2c4b7a1d6e8035ab41cd52e79f0b3d16a8c4e7",
    BEP20: "0x9f2c4b7a1d6e8035ab41cd52e79f0b3d16a8c4e7",
};

const USDT_INR_RATE = "73.42";

export default function UsdtWallet() {
    const { mobile, mode } = useLocalSearchParams();
    const [network, setNetwork] = useState("TRC20");
    const [address, setAddress] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleBack = () => {
        Keyboard.dismiss();

        if (router.canGoBack()) {
            router.back();
            return;
        }

        router.replace({
            pathname: "/aadhaar-kyc",
            params: {
                mobile: String(mobile || ""),
                mode: mode === "signin" ? "signin" : "signup",
                verified: "1",
            },
        });
    };

    const handleLinkWallet = async () => {
        if (!address.trim()) {
            setError("Paste your USDT wallet address to continue.");
            return;
        }

        Keyboard.dismiss();
        setIsLoading(true);
        setError("");

        try {
            await linkUsdtWallet(network, address.trim());
            router.replace("/login");
        } catch (linkError) {
            setError(getUserFacingError(linkError));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.container}
            >
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={26} color="#657189" />
                    </TouchableOpacity>
                    <View style={styles.headerCopy}>
                        <Text style={styles.headerTitle}>USDT Wallet</Text>
                        <Text style={styles.headerSubtitle}>
                            Link your crypto wallet · Step 4 of 4
                        </Text>
                    </View>
                    <View style={styles.stepBadge}>
                        <Text style={styles.stepBadgeText}>4/4</Text>
                    </View>
                </View>

                <View style={styles.progressTrack}>
                    <LinearGradient
                        colors={["#00C987", "#6366F1"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.progress}
                    />
                </View>

                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <LinearGradient
                        colors={["#0C1B2E", "#123049"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.heroCard}
                    >
                        <View style={styles.tetherTile}>
                            <Text style={styles.tetherGlyph}>₮</Text>
                        </View>
                        <Text style={styles.heroTitle}>Tether USDT</Text>
                        <Text style={styles.heroRate}>
                            1 USDT = ₹{USDT_INR_RATE} · Live rate
                        </Text>
                        <View style={styles.heroBadges}>
                            <Text style={styles.heroBadge}>⚡ Instant</Text>
                            <Text style={styles.heroBadge}>🔐 Secure</Text>
                            <Text style={styles.heroBadge}>🌐 Global</Text>
                        </View>
                    </LinearGradient>

                    <Text style={styles.label}>SELECT NETWORK</Text>
                    <View style={styles.networkRow}>
                        {NETWORKS.map((item) => {
                            const isActive = item === network;
                            return (
                                <TouchableOpacity
                                    key={item}
                                    style={[
                                        styles.networkChip,
                                        isActive && styles.networkChipActive,
                                    ]}
                                    onPress={() => {
                                        setNetwork(item);
                                        setError("");
                                    }}
                                    accessibilityRole="button"
                                    accessibilityState={{ selected: isActive }}
                                >
                                    <Text
                                        style={[
                                            styles.networkChipText,
                                            isActive && styles.networkChipTextActive,
                                        ]}
                                    >
                                        {item}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    <Text style={styles.label}>YOUR USDT WALLET ADDRESS</Text>
                    <TextInput
                        style={styles.addressInput}
                        value={address}
                        onChangeText={(value) => {
                            setAddress(value.trim());
                            setError("");
                        }}
                        placeholder={`Paste your ${network} wallet address`}
                        placeholderTextColor="#AEB5C7"
                        autoCapitalize="none"
                        autoCorrect={false}
                        multiline
                    />

                    {__DEV__ ? (
                        <TouchableOpacity
                            onPress={() => {
                                setAddress(DEMO_ADDRESSES[network]);
                                setError("");
                            }}
                        >
                            <Text style={styles.demoLink}>Use demo address</Text>
                        </TouchableOpacity>
                    ) : null}

                    {error ? <Text style={styles.errorText}>{error}</Text> : null}

                    <TouchableOpacity
                        style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
                        disabled={isLoading}
                        onPress={handleLinkWallet}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <>
                                <Text style={styles.primaryButtonText}>LINK WALLET</Text>
                                <Ionicons name="arrow-forward" size={24} color="#FFFFFF" />
                            </>
                        )}
                    </TouchableOpacity>

                    <Text style={styles.footnote}>
                        This wallet will receive your contest winnings instantly
                    </Text>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: "#F4F6FF" },
    container: { flex: 1 },
    scrollContent: { paddingHorizontal: 24, paddingBottom: 40, paddingTop: 22 },
    header: {
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        flexDirection: "row",
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    backButton: {
        alignItems: "center",
        backgroundColor: "#EEF1FB",
        borderRadius: 21,
        height: 42,
        justifyContent: "center",
        width: 42,
    },
    headerCopy: { flex: 1, marginLeft: 14 },
    headerTitle: { color: "#071329", fontSize: 20, fontWeight: "800" },
    headerSubtitle: { color: "#7D8190", fontSize: 13, marginTop: 3 },
    stepBadge: {
        backgroundColor: "#E8E8FF",
        borderRadius: 15,
        paddingHorizontal: 14,
        paddingVertical: 8,
    },
    stepBadgeText: { color: "#5865D9", fontSize: 13, fontWeight: "800" },
    progressTrack: { backgroundColor: "#DFE4F2", height: 4 },
    progress: { height: 4, width: "100%" },
    heroCard: {
        alignItems: "center",
        borderRadius: 22,
        paddingHorizontal: 24,
        paddingVertical: 30,
    },
    tetherTile: {
        alignItems: "center",
        backgroundColor: "#1BA27A",
        borderRadius: 20,
        height: 74,
        justifyContent: "center",
        width: 74,
    },
    tetherGlyph: { color: "#FFFFFF", fontSize: 38, fontWeight: "800" },
    heroTitle: {
        color: "#FFFFFF",
        fontSize: 26,
        fontWeight: "900",
        marginTop: 18,
    },
    heroRate: { color: "#B6C3D8", fontSize: 14, marginTop: 8 },
    heroBadges: { flexDirection: "row", gap: 18, marginTop: 16 },
    heroBadge: { color: "#DCE2F2", fontSize: 13 },
    label: {
        color: "#7A849A",
        fontSize: 12,
        fontWeight: "700",
        letterSpacing: 1,
        marginBottom: 12,
        marginTop: 26,
    },
    networkRow: { flexDirection: "row", gap: 12 },
    networkChip: {
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        borderColor: "#E7EAF4",
        borderRadius: 16,
        borderWidth: 1.5,
        flex: 1,
        justifyContent: "center",
        minHeight: 54,
    },
    networkChipActive: { backgroundColor: "#E7F8F1", borderColor: "#1BA27A" },
    networkChipText: { color: "#4A5468", fontSize: 15, fontWeight: "700" },
    networkChipTextActive: { color: "#0F8A66" },
    addressInput: {
        backgroundColor: "#FFFFFF",
        borderColor: "#ECEEF5",
        borderRadius: 16,
        borderWidth: 1,
        color: "#071329",
        fontSize: 15,
        minHeight: 88,
        paddingHorizontal: 18,
        paddingVertical: 16,
        textAlignVertical: "top",
    },
    demoLink: {
        color: "#0F8A66",
        fontSize: 13,
        fontWeight: "700",
        marginTop: 12,
    },
    errorText: { color: "#D8385A", fontSize: 14, marginTop: 14 },
    primaryButton: {
        alignItems: "center",
        backgroundColor: "#199A72",
        borderRadius: 18,
        flexDirection: "row",
        gap: 12,
        justifyContent: "center",
        marginTop: 26,
        minHeight: 62,
    },
    buttonDisabled: { opacity: 0.7 },
    primaryButtonText: {
        color: "#FFFFFF",
        fontSize: 18,
        fontWeight: "900",
        letterSpacing: 0.6,
    },
    footnote: {
        color: "#7A849A",
        fontSize: 13,
        marginTop: 18,
        textAlign: "center",
    },
});
