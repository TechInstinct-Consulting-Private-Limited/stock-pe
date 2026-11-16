import { Ionicons } from "@expo/vector-icons";
import * as LocalAuthentication from "expo-local-authentication";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MpinInput from "../src/components/MpinInput";
import { getOnboardingStatus, getUserFacingError, refreshAuthSession, unlockWithMpin } from "../src/services/api";
import { clearAuthSession, getBiometricEnabled, getDeviceId, getLastActiveMobile, setAuthSession } from "../src/services/authStorage";
import { getPostAuthenticationRoute } from "../src/services/msg91Auth";

function formatMobile(mobile) {
  const clean = String(mobile || "").replace(/\D/g, "");
  return clean.length === 10 ? `+91 ${clean.slice(0, 5)} ${clean.slice(5)}` : "your account";
}

export default function MpinUnlockScreen() {
  const params = useLocalSearchParams();
  const [mobile, setMobile] = useState(String(params.mobile || "").replace(/\D/g, "").slice(-10));
  const [mpin, setMpin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  useEffect(() => {
    if (!mobile) getLastActiveMobile().then((savedMobile) => setMobile(savedMobile || ""));
  }, [mobile]);

  useEffect(() => {
    Promise.all([getBiometricEnabled(), LocalAuthentication.hasHardwareAsync(), LocalAuthentication.isEnrolledAsync()])
      .then(([enabled, hardware, enrolled]) => setBiometricAvailable(Boolean(enabled && hardware && enrolled)))
      .catch(() => setBiometricAvailable(false));
  }, []);

  const completeUnlock = async (session) => {
    await setAuthSession({ ...session, mobile });
    const onboarding = await getOnboardingStatus();
    router.replace(getPostAuthenticationRoute({ onboarding, mobile, mode: "signin" }));
  };

  const unlock = async (submittedMpin = mpin) => {
    if (!/^\d{10}$/.test(mobile)) return setError("Select the mobile number to unlock.");
    if (!/^\d{6}$/.test(submittedMpin)) return setError("Enter your 6-digit MPIN.");
    setLoading(true);
    setError("");
    try {
      const deviceId = await getDeviceId();
      const session = await unlockWithMpin(deviceId, submittedMpin, mobile);
      await completeUnlock(session);
    } catch (err) {
      setMpin("");
      setError(getUserFacingError(err));
    } finally {
      setLoading(false);
    }
  };

  const reset = async () => {
    await clearAuthSession();
    router.replace("/login");
  };

  const switchAccount = async () => {
    await clearAuthSession();
    router.replace("/login");
  };

  const biometricUnlock = async () => {
    if (!/^\d{10}$/.test(mobile)) return switchAccount();
    setLoading(true);
    setError("");
    try {
      const result = await LocalAuthentication.authenticateAsync({ promptMessage: "Unlock MarketPe", disableDeviceFallback: false });
      if (!result.success) throw new Error("Biometric verification was not completed.");
      const session = await refreshAuthSession();
      await completeUnlock(session);
    } catch (err) {
      setError(getUserFacingError(err, err?.message || "Could not unlock with biometrics."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.keyboard} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} automaticallyAdjustKeyboardInsets>
          <View style={styles.container}>
            <View style={styles.icon}><Ionicons name="lock-closed-outline" size={36} color="#00A86B" /></View>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.account}>Continue as {formatMobile(mobile)}</Text>
            <Text style={styles.copy}>Enter your MPIN to unlock MarketPe.</Text>
            <MpinInput autoFocus value={mpin} onChange={(value) => { setMpin(value); setError(""); }} onComplete={unlock} accessibilityLabel="Enter six digit MPIN" />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <TouchableOpacity onPress={unlock} disabled={loading} style={[styles.button, loading && styles.disabled]}><Text style={styles.buttonText}>{loading ? "UNLOCKING..." : "UNLOCK"}</Text></TouchableOpacity>
            {biometricAvailable ? <TouchableOpacity onPress={biometricUnlock} disabled={loading} style={styles.bio}><Ionicons name="finger-print-outline" size={21} color="#059669" /><Text style={styles.bioText}>Use biometric unlock</Text></TouchableOpacity> : null}
            <TouchableOpacity onPress={switchAccount} style={styles.link}><Text style={styles.linkText}>Switch account</Text></TouchableOpacity>
            <TouchableOpacity onPress={reset} style={styles.secondaryLink}><Text style={styles.secondaryLinkText}>Forgot MPIN? Verify with OTP</Text></TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" }, keyboard: { flex: 1 }, scrollContent: { flexGrow: 1, paddingVertical: 20 }, container: { flexGrow: 1, paddingHorizontal: 28, justifyContent: "center" },
  icon: { width: 76, height: 76, borderRadius: 24, alignItems: "center", justifyContent: "center", backgroundColor: "#E6FBF3", alignSelf: "center", marginBottom: 24 },
  title: { fontSize: 28, fontWeight: "900", color: "#0F172A", textAlign: "center" }, account: { fontSize: 15, fontWeight: "800", color: "#047857", textAlign: "center", marginTop: 10 }, copy: { fontSize: 14, color: "#64748B", textAlign: "center", marginTop: 8, marginBottom: 28 },
  button: { height: 58, borderRadius: 16, backgroundColor: "#00C987", alignItems: "center", justifyContent: "center", marginTop: 22 }, disabled: { opacity: 0.6 }, buttonText: { fontSize: 15, fontWeight: "900", letterSpacing: 1, color: "#fff" },
  bio: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8, marginTop: 18 }, bioText: { fontSize: 14, fontWeight: "800", color: "#059669" }, error: { color: "#DC2626", fontSize: 13, fontWeight: "700", marginTop: 12, textAlign: "center" },
  link: { alignItems: "center", marginTop: 24 }, linkText: { fontSize: 14, fontWeight: "900", color: "#059669" }, secondaryLink: { alignItems: "center", marginTop: 14 }, secondaryLinkText: { fontSize: 13, fontWeight: "800", color: "#64748B" },
});
