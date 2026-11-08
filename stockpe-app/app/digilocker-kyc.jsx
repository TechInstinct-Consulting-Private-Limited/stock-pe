import { Ionicons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getAadhaarKycStatus, getDigiLockerKycStatus, getDigiLockerSessionStatus, getUserFacingError, initiateDigiLockerKyc } from "../src/services/api";

export default function DigiLockerKyc() {
    const { mobile, mode, sessionId, callback } = useLocalSearchParams();
    const [verificationId, setVerificationId] = useState("");
    const [loading, setLoading] = useState(false);
    const [checking, setChecking] = useState(true);
    const [message, setMessage] = useState("");
    const [completed, setCompleted] = useState(false);

    const continueToWallet = useCallback(() => {
        router.replace({ pathname: "/usdt-wallet", params: { mobile: String(mobile || ""), mode: mode === "signin" ? "signin" : "signup", verified: "1" } });
    }, [mobile, mode]);

    useEffect(() => {
        let active = true;
        (async () => {
            try {
                const status = await getAadhaarKycStatus();
                if (active && status?.status === "verified") continueToWallet();
            } catch (_error) {
                // The user can still start a new provider session once the API is reachable.
            } finally {
                if (active) setChecking(false);
            }
        })();
        return () => { active = false; };
    }, [continueToWallet]);

    const checkStatus = useCallback(async (id = verificationId) => {
        if (!id) return;
        setLoading(true);
        setMessage("");
        try {
            const result = await getDigiLockerKycStatus(id);
            if (result?.completed || result?.status === "verified") {
                setCompleted(true);
                return;
            }
            if (result?.status === "failed" || result?.status === "expired") {
                setVerificationId("");
                setMessage(result.status === "expired" ? "This DigiLocker session expired. Start a new verification." : "DigiLocker consent was not completed. Start again to retry.");
                return;
            }
            setMessage("Verification is still pending. Complete consent in DigiLocker, return here, then check again.");
        } catch (error) {
            setMessage(getUserFacingError(error));
        } finally {
            setLoading(false);
        }
    }, [continueToWallet, verificationId]);

    const checkSessionStatus = useCallback(async () => {
        if (typeof sessionId !== "string" || !sessionId) return;
        setLoading(true);
        setMessage("");
        try {
            const result = await getDigiLockerSessionStatus(sessionId);
            if (result?.completed || result?.status === "verified") {
                setCompleted(true);
                return;
            }
            if (result?.status === "failed" || result?.status === "expired") {
                setMessage(result.status === "expired" ? "This DigiLocker session expired. Start a new verification." : "DigiLocker consent was not completed. Start again to retry.");
                return;
            }
            setMessage("Verification is still pending. Please wait a moment and try again.");
        } catch (error) {
            setMessage(getUserFacingError(error));
        } finally {
            setLoading(false);
        }
    }, [sessionId]);

    useEffect(() => {
        if (callback === "1" && sessionId) checkSessionStatus();
    }, [callback, checkSessionStatus, sessionId]);

    const startVerification = async () => {
        setLoading(true);
        setMessage("");
        try {
            const result = await initiateDigiLockerKyc();
            setVerificationId(result.verificationId);
            await WebBrowser.openBrowserAsync(result.authorizationUrl, { presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET });
            await checkStatus(result.verificationId);
        } catch (error) {
            setMessage(getUserFacingError(error));
        } finally {
            setLoading(false);
        }
    };

    const skip = () => {
        Alert.alert("Skip KYC for now?", "You can complete DigiLocker verification later from Profile. Some future wallet features may require KYC.", [
            { text: "Continue verification", style: "cancel" },
            { text: "Skip for now", onPress: () => router.replace("/(tabs)/events") },
        ]);
    };

    if (checking) return <SafeAreaView style={styles.safe}><View style={styles.loading}><ActivityIndicator color="#00C987" size="large" /></View></SafeAreaView>;

    if (completed) return <SafeAreaView style={styles.safe} edges={["top", "bottom"]}><View style={styles.screen}><View style={styles.content}>
        <View style={styles.successIcon}><Ionicons name="checkmark" size={48} color="#FFFFFF" /></View>
        <Text style={styles.title}>Aadhaar KYC Verification Completed</Text>
        <Text style={styles.description}>Your identity verification was completed securely through DigiLocker.</Text>
        <View style={styles.info}><Ionicons name="shield-checkmark-outline" size={20} color="#047857" /><Text style={styles.infoText}>Your Aadhaar OTP was handled only by DigiLocker. StockPe did not receive or store your OTP.</Text></View>
        <TouchableOpacity style={styles.primaryButton} onPress={continueToWallet}><Text style={styles.primaryText}>Continue to wallet</Text><Ionicons name="arrow-forward" size={21} color="#FFFFFF" /></TouchableOpacity>
    </View></View></SafeAreaView>;

    return <SafeAreaView style={styles.safe} edges={["top", "bottom"]}><View style={styles.screen}>
        <View style={styles.header}><TouchableOpacity style={styles.iconButton} onPress={() => router.back()}><Ionicons name="arrow-back" size={23} color="#0F172A" /></TouchableOpacity><Text style={styles.headerTitle}>Identity verification</Text><View style={styles.iconButton} /></View>
        <View style={styles.content}>
            <View style={styles.iconWrap}><Ionicons name="shield-checkmark-outline" size={44} color="#00A878" /></View>
            <Text style={styles.title}>Verify with DigiLocker</Text>
            <Text style={styles.description}>Securely verify your identity through DigiLocker. Aadhaar OTP and consent are completed on the official DigiLocker journey, not inside StockPe.</Text>
            <View style={styles.info}><Ionicons name="lock-closed-outline" size={20} color="#047857" /><Text style={styles.infoText}>We request only your Aadhaar document consent for KYC. Your OTP is never collected by this app.</Text></View>
            {message ? <View style={styles.message}><Text style={styles.messageText}>{message}</Text></View> : null}
            {verificationId ? <TouchableOpacity disabled={loading} style={[styles.secondaryButton, loading && styles.disabled]} onPress={() => checkStatus()}><Text style={styles.secondaryText}>{loading ? "Checking…" : "I have completed DigiLocker"}</Text></TouchableOpacity> : null}
            <TouchableOpacity disabled={loading} style={[styles.primaryButton, loading && styles.disabled]} onPress={startVerification}><Ionicons name="open-outline" size={21} color="#FFFFFF" /><Text style={styles.primaryText}>{loading ? "Opening DigiLocker…" : verificationId ? "Start a new DigiLocker session" : "Continue to DigiLocker"}</Text></TouchableOpacity>
            <TouchableOpacity disabled={loading} style={styles.skipButton} onPress={skip}><Text style={styles.skipText}>Skip for now</Text></TouchableOpacity>
            <Text style={styles.note}>DigiLocker verification may require an Aadhaar-linked mobile number. You can return to this screen after granting consent.</Text>
        </View>
    </View></SafeAreaView>;
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: "#FFFFFF" }, screen: { flex: 1, backgroundColor: "#F8FAFC" }, loading: { flex: 1, alignItems: "center", justifyContent: "center" },
    header: { height: 64, backgroundColor: "#FFFFFF", borderBottomColor: "#E2E8F0", borderBottomWidth: 1, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16 }, iconButton: { width: 38, height: 38, alignItems: "center", justifyContent: "center" }, headerTitle: { fontSize: 16, fontWeight: "900", color: "#0F172A" },
    content: { flex: 1, padding: 24, alignItems: "center", justifyContent: "center" }, iconWrap: { width: 88, height: 88, borderRadius: 44, backgroundColor: "#E6FBF3", alignItems: "center", justifyContent: "center", marginBottom: 22 }, title: { fontSize: 25, fontWeight: "900", color: "#071329", textAlign: "center" }, description: { marginTop: 12, color: "#526176", fontSize: 14, lineHeight: 21, textAlign: "center" }, info: { width: "100%", flexDirection: "row", gap: 11, padding: 15, marginTop: 25, backgroundColor: "#ECFDF5", borderRadius: 16, borderWidth: 1, borderColor: "#A7F3D0" }, infoText: { flex: 1, color: "#065F46", fontSize: 12, lineHeight: 18 }, message: { width: "100%", marginTop: 14, padding: 13, borderRadius: 12, backgroundColor: "#FFF7ED", borderWidth: 1, borderColor: "#FED7AA" }, messageText: { color: "#9A3412", fontSize: 12, lineHeight: 18 },
    primaryButton: { width: "100%", marginTop: 24, minHeight: 56, flexDirection: "row", gap: 9, justifyContent: "center", alignItems: "center", backgroundColor: "#00B981", borderRadius: 16 }, primaryText: { color: "#FFFFFF", fontSize: 16, fontWeight: "900" }, secondaryButton: { width: "100%", minHeight: 52, marginTop: 18, justifyContent: "center", alignItems: "center", borderRadius: 15, borderWidth: 1, borderColor: "#00B981", backgroundColor: "#FFFFFF" }, secondaryText: { color: "#007C5A", fontSize: 15, fontWeight: "900" }, disabled: { opacity: 0.58 }, skipButton: { marginTop: 18, padding: 10 }, skipText: { color: "#526176", fontSize: 14, fontWeight: "800", textDecorationLine: "underline" }, note: { marginTop: 14, color: "#94A3B8", fontSize: 11, textAlign: "center", lineHeight: 16 }, successIcon: { width: 92, height: 92, borderRadius: 46, backgroundColor: "#00B981", alignItems: "center", justifyContent: "center", marginBottom: 22 },
});
