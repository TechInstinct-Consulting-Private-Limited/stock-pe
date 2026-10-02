import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getOnboardingStatus, getUserFacingError } from "../src/services/api";

// Temporary wallet-demo destination until the dashboard team's tab navigator
// is merged. Switch only this route constant when /events becomes available.
const POST_ONBOARDING_ROUTE = "/wallet";

export default function OnboardingComplete() {
    const [status, setStatus] = useState(null);
    const [error, setError] = useState("");

    const loadStatus = useCallback(async () => {
        setError("");
        try {
            const result = await getOnboardingStatus();

            if (!result.onboardingCompleted) {
                router.replace(result.nextStep === "wallet" ? "/usdt-wallet" : "/login");
                return;
            }

            setStatus(result);
        } catch (statusError) {
            setError(
                getUserFacingError(
                    statusError,
                    "We could not verify your onboarding status. Please try again."
                )
            );
        }
    }, []);

    useEffect(() => {
        loadStatus();
    }, [loadStatus]);

    if (!status || error) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.stateContainer}>
                    {error ? (
                        <>
                            <Ionicons name="alert-circle-outline" size={44} color="#D8385A" />
                            <Text style={styles.stateTitle}>Verification unavailable</Text>
                            <Text style={styles.stateCopy}>{error}</Text>
                            <TouchableOpacity onPress={loadStatus} style={styles.retryButton}>
                                <Text style={styles.retryButtonText}>TRY AGAIN</Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <>
                            <ActivityIndicator color="#08B778" size="large" />
                            <Text style={styles.stateTitle}>Confirming your onboarding</Text>
                        </>
                    )}
                </View>
            </SafeAreaView>
        );
    }

    const completedSteps = [
        { label: "Mobile OTP", tone: "mint" },
        {
            label: `Aadhaar KYC · ${status.aadhaarKyc.method.label}`,
            tone: "violet",
        },
        {
            label: `USDT Wallet Linked · ${status.wallet.network}`,
            tone: "mint",
        },
    ];

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <View style={styles.hero}>
                    <View style={styles.outerRing}>
                        <LinearGradient
                            colors={["#E6F7F1", "#EDF4FF"]}
                            style={styles.checkCircle}
                        >
                            <Ionicons name="checkmark-circle-outline" size={72} color="#08B778" />
                        </LinearGradient>
                    </View>

                    <View style={styles.verifiedRow}>
                        <View style={styles.verifiedDot} />
                        <Text style={styles.verifiedText}>KYC VERIFIED</Text>
                    </View>

                    <Text style={styles.title}>You&apos;re In!</Text>
                    <Text style={styles.subtitle}>
                        Identity confirmed · USDT wallet linked{"\n"}
                        Start predicting & winning now
                    </Text>
                </View>

                <View style={styles.stepsCard}>
                    {completedSteps.map((step) => (
                        <View key={step.label} style={styles.stepRow}>
                            <View
                                style={[
                                    styles.stepIcon,
                                    step.tone === "violet"
                                        ? styles.stepIconViolet
                                        : styles.stepIconMint,
                                ]}
                            >
                                <Ionicons
                                    name="checkmark"
                                    size={16}
                                    color={step.tone === "violet" ? "#6865E7" : "#12AE7C"}
                                />
                            </View>
                            <Text style={styles.stepLabel}>{step.label}</Text>
                            <Text
                                style={[
                                    styles.doneText,
                                    step.tone === "violet"
                                        ? styles.doneTextViolet
                                        : styles.doneTextMint,
                                ]}
                            >
                                Done
                            </Text>
                        </View>
                    ))}
                </View>

                <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityLabel="Open my wallet"
                    activeOpacity={0.88}
                    onPress={() => router.replace(POST_ONBOARDING_ROUTE)}
                    style={styles.startButton}
                >
                    <Text style={styles.startButtonText}>START TRADING</Text>
                    <Ionicons name="arrow-forward" size={27} color="#FFFFFF" />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: "#F5F9FF" },
    stateContainer: { alignItems: "center", flex: 1, justifyContent: "center", paddingHorizontal: 36 },
    stateTitle: { color: "#263146", fontSize: 20, fontWeight: "800", marginTop: 18, textAlign: "center" },
    stateCopy: { color: "#6A7489", fontSize: 15, lineHeight: 22, marginTop: 10, textAlign: "center" },
    retryButton: { backgroundColor: "#00B97B", borderRadius: 15, marginTop: 24, paddingHorizontal: 28, paddingVertical: 14 },
    retryButtonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800", letterSpacing: 0.4 },
    container: { flex: 1, justifyContent: "center", paddingHorizontal: 34 },
    hero: { alignItems: "center", marginTop: -45 },
    outerRing: {
        alignItems: "center",
        borderColor: "#D8EBEF",
        borderRadius: 126,
        borderWidth: 1,
        height: 252,
        justifyContent: "center",
        width: 252,
    },
    checkCircle: {
        alignItems: "center",
        borderColor: "#A6DED3",
        borderRadius: 78,
        borderWidth: 1.5,
        height: 156,
        justifyContent: "center",
        width: 156,
    },
    verifiedRow: { alignItems: "center", flexDirection: "row", gap: 10, marginTop: 30 },
    verifiedDot: { backgroundColor: "#00B97B", borderRadius: 4, height: 7, width: 7 },
    verifiedText: { color: "#0BAF84", fontSize: 12, fontWeight: "800", letterSpacing: 5 },
    title: { color: "#0AAE7F", fontSize: 47, fontWeight: "900", letterSpacing: -1, marginTop: 20 },
    subtitle: { color: "#6A7489", fontSize: 16, lineHeight: 26, marginTop: 12, textAlign: "center" },
    stepsCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 22,
        elevation: 5,
        marginHorizontal: 16,
        marginTop: 38,
        paddingHorizontal: 22,
        paddingVertical: 14,
        shadowColor: "#73819B",
        shadowOffset: { height: 5, width: 0 },
        shadowOpacity: 0.12,
        shadowRadius: 14,
    },
    stepRow: { alignItems: "center", flexDirection: "row", minHeight: 49 },
    stepIcon: { alignItems: "center", borderRadius: 16, height: 32, justifyContent: "center", width: 32 },
    stepIconMint: { backgroundColor: "#E6F9F2", borderColor: "#BDEADA", borderWidth: 1 },
    stepIconViolet: { backgroundColor: "#F0F0FF", borderColor: "#D6D5FF", borderWidth: 1 },
    stepLabel: { color: "#263146", flex: 1, fontSize: 17, marginLeft: 18 },
    doneText: { fontSize: 13, fontWeight: "700" },
    doneTextMint: { color: "#0BAF84" },
    doneTextViolet: { color: "#6865E7" },
    startButton: {
        alignItems: "center",
        backgroundColor: "#00B97B",
        borderRadius: 19,
        elevation: 5,
        flexDirection: "row",
        gap: 15,
        justifyContent: "center",
        marginHorizontal: 16,
        marginTop: 38,
        minHeight: 67,
        shadowColor: "#00A872",
        shadowOffset: { height: 8, width: 0 },
        shadowOpacity: 0.24,
        shadowRadius: 12,
    },
    startButtonText: { color: "#FFFFFF", fontSize: 23, fontWeight: "900", letterSpacing: 0.4 },
});
