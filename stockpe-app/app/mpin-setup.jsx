import { Ionicons } from "@expo/vector-icons";
import * as LocalAuthentication from "expo-local-authentication";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getOnboardingStatus, setupMpin, getUserFacingError } from "../src/services/api";
import { ensureDeviceId, setAuthSession, setBiometricEnabled } from "../src/services/authStorage";
import { getPostAuthenticationRoute } from "../src/services/msg91Auth";
import MpinInput from "../src/components/MpinInput";

export default function MpinSetupScreen() {
  const [mpin, setMpin] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometric] = useState(false);
  const confirmRef = useRef(null);

  useEffect(() => {
    Promise.all([LocalAuthentication.hasHardwareAsync(), LocalAuthentication.isEnrolledAsync()])
      .then(([hardware, enrolled]) => setBiometricAvailable(Boolean(hardware && enrolled)))
      .catch(() => setBiometricAvailable(false));
  }, []);

  const save = async () => {
    if (!/^\d{6}$/.test(mpin)) return setError("Enter a 6-digit MPIN.");
    if (mpin !== confirm) return setError("The two MPIN entries do not match.");
    setLoading(true); setError("");
    try {
      const deviceId = await ensureDeviceId();
      const session = await setupMpin(deviceId, mpin, biometricEnabled);
      await setAuthSession(session);
      await setBiometricEnabled(biometricEnabled);
      const onboarding = await getOnboardingStatus();
      router.replace(getPostAuthenticationRoute({ onboarding, mode: "signin" }));
    } catch (err) { setError(getUserFacingError(err)); }
    finally { setLoading(false); }
  };

  return <SafeAreaView style={styles.safe}><KeyboardAvoidingView style={styles.keyboard} behavior={Platform.OS === "ios" ? "padding" : "height"}>
    <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} automaticallyAdjustKeyboardInsets>
      <View style={styles.container}>
    <View style={styles.icon}><Ionicons name="shield-checkmark-outline" size={38} color="#00A86B" /></View>
    <Text style={styles.title}>Set your 6-digit MPIN</Text>
    <Text style={styles.copy}>Use this MPIN to unlock MarketPe quickly on this device. Do not share it with anyone.</Text>
    <Text style={styles.label}>CREATE MPIN</Text>
    <MpinInput value={mpin} onChange={(value) => { setMpin(value); setError(""); }} onComplete={() => confirmRef.current?.focus()} autoFocus accessibilityLabel="Create six digit MPIN" />
    <Text style={styles.label}>CONFIRM MPIN</Text>
    <MpinInput inputRef={confirmRef} value={confirm} onChange={(value) => { setConfirm(value); setError(""); }} accessibilityLabel="Confirm six digit MPIN" />
    {biometricAvailable ? <TouchableOpacity style={styles.bioRow} onPress={() => setBiometric((value) => !value)}><Ionicons name={biometricEnabled ? "checkbox" : "square-outline"} size={23} color="#059669" /><View style={styles.bioCopy}><Text style={styles.bioTitle}>Enable biometric unlock</Text><Text style={styles.bioText}>Use your fingerprint or Face ID on this device.</Text></View></TouchableOpacity> : null}
    {error ? <Text style={styles.error}>{error}</Text> : null}
    <TouchableOpacity onPress={save} disabled={loading} style={[styles.button, loading && styles.disabled]}><Text style={styles.buttonText}>{loading ? "SAVING..." : "CONTINUE"}</Text><Ionicons name="arrow-forward" size={22} color="#fff" /></TouchableOpacity>
    <Text style={styles.note}>{biometricAvailable ? "You can change this later from Security." : "Biometric unlock appears when this device supports it."}</Text>
      </View>
    </ScrollView>
  </KeyboardAvoidingView></SafeAreaView>;
}
const styles = StyleSheet.create({ safe:{flex:1,backgroundColor:"#fff"},keyboard:{flex:1},scrollContent:{flexGrow:1,paddingVertical:20},container:{flexGrow:1,paddingHorizontal:28,justifyContent:"center"},icon:{width:76,height:76,borderRadius:24,alignItems:"center",justifyContent:"center",backgroundColor:"#E6FBF3",alignSelf:"center",marginBottom:24},title:{fontSize:27,fontWeight:"900",color:"#0F172A",textAlign:"center"},copy:{fontSize:14,lineHeight:21,color:"#64748B",textAlign:"center",marginTop:10,marginBottom:30},label:{fontSize:12,fontWeight:"900",letterSpacing:1,color:"#475569",marginBottom:8,marginTop:14},bioRow:{flexDirection:"row",alignItems:"center",padding:13,borderWidth:1,borderColor:"#D1FAE5",backgroundColor:"#F0FDF4",borderRadius:14,marginTop:18},bioCopy:{flex:1,marginLeft:10},bioTitle:{fontSize:14,fontWeight:"800",color:"#065F46"},bioText:{fontSize:12,color:"#64748B",marginTop:3},button:{height:58,borderRadius:16,backgroundColor:"#00C987",alignItems:"center",justifyContent:"center",flexDirection:"row",gap:9,marginTop:28},disabled:{opacity:.6},buttonText:{fontSize:15,fontWeight:"900",letterSpacing:1,color:"#fff"},error:{color:"#DC2626",fontSize:13,fontWeight:"700",marginTop:12,textAlign:"center"},note:{fontSize:12,lineHeight:18,color:"#94A3B8",textAlign:"center",marginTop:20} });
