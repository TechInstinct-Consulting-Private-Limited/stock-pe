import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getOnboardingStatus, setupMpin, getUserFacingError } from "../src/services/api";
import { ensureDeviceId, setAuthSession } from "../src/services/authStorage";
import { getPostAuthenticationRoute } from "../src/services/msg91Auth";
import MpinInput from "../src/components/MpinInput";

export default function MpinSetupScreen() {
  const [mpin, setMpin] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const confirmRef = useRef(null);

  const save = async () => {
    if (!/^\d{6}$/.test(mpin)) return setError("Enter a 6-digit MPIN.");
    if (mpin !== confirm) return setError("The two MPIN entries do not match.");
    setLoading(true); setError("");
    try {
      const deviceId = await ensureDeviceId();
      const session = await setupMpin(deviceId, mpin);
      await setAuthSession(session);
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
    {error ? <Text style={styles.error}>{error}</Text> : null}
    <TouchableOpacity onPress={save} disabled={loading} style={[styles.button, loading && styles.disabled]}><Text style={styles.buttonText}>{loading ? "SAVING..." : "CONTINUE"}</Text><Ionicons name="arrow-forward" size={22} color="#fff" /></TouchableOpacity>
    <Text style={styles.note}>Your MPIN unlocks MarketPe on this device. Do not share it with anyone.</Text>
      </View>
    </ScrollView>
  </KeyboardAvoidingView></SafeAreaView>;
}
const styles = StyleSheet.create({ safe:{flex:1,backgroundColor:"#fff"},keyboard:{flex:1},scrollContent:{flexGrow:1,paddingVertical:20},container:{flexGrow:1,paddingHorizontal:28,justifyContent:"center"},icon:{width:76,height:76,borderRadius:24,alignItems:"center",justifyContent:"center",backgroundColor:"#E6FBF3",alignSelf:"center",marginBottom:24},title:{fontSize:27,fontWeight:"900",color:"#0F172A",textAlign:"center"},copy:{fontSize:14,lineHeight:21,color:"#64748B",textAlign:"center",marginTop:10,marginBottom:30},label:{fontSize:12,fontWeight:"900",letterSpacing:1,color:"#475569",marginBottom:8,marginTop:14},button:{height:58,borderRadius:16,backgroundColor:"#00C987",alignItems:"center",justifyContent:"center",flexDirection:"row",gap:9,marginTop:28},disabled:{opacity:.6},buttonText:{fontSize:15,fontWeight:"900",letterSpacing:1,color:"#fff"},error:{color:"#DC2626",fontSize:13,fontWeight:"700",marginTop:12,textAlign:"center"},note:{fontSize:12,lineHeight:18,color:"#94A3B8",textAlign:"center",marginTop:20} });
