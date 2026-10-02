import React from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useProfileKyc } from "../hooks/useProfileKyc";
import KycDocumentStepCard from "../components/KycDocumentStepCard";

export default function KycScreen() {
  const router = useRouter();
  const { kycData, isLoading, refresh } = useProfileKyc();
  const verified = kycData?.kycOverallStatus === "VERIFIED";

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}><Ionicons name="arrow-back" size={22} color="#0F172A" /></TouchableOpacity>
          <Text style={styles.headerTitle}>KYC & Security</Text>
          <TouchableOpacity onPress={refresh} style={styles.backBtn}><Ionicons name="refresh" size={20} color="#64748B" /></TouchableOpacity>
        </View>
        {isLoading ? <View style={styles.loading}><ActivityIndicator size="large" color="#00C987" /></View> : (
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <View style={[styles.hero, verified ? styles.heroVerified : styles.heroPending]}>
              <Ionicons name={verified ? "shield-checkmark" : "shield-outline"} size={30} color={verified ? "#00C987" : "#D97706"} />
              <View style={styles.heroText}><Text style={styles.heroTitle}>{verified ? "Aadhaar KYC verified" : "Aadhaar KYC pending"}</Text><Text style={styles.heroSub}>Only actual onboarding status is shown here. Real-money payouts are not enabled in this demo.</Text></View>
            </View>
            <Text style={styles.section}>ONBOARDING STATUS</Text>
            <KycDocumentStepCard title="Mobile number" subtitle="OTP sign-in" icon="phone-portrait-outline" status={kycData?.mobileStatus} maskedDetail={kycData?.mobileStatus === "VERIFIED" ? "Verified" : "Pending"} />
            <KycDocumentStepCard title="Aadhaar verification" subtitle={kycData?.aadhaarMethod ? `${kycData.aadhaarMethod} verification` : "Complete demo Aadhaar OTP flow"} icon="finger-print-outline" status={kycData?.aadhaarStatus} maskedDetail={verified ? "Verified" : "Tap to continue"} onPress={() => !verified && router.push("/aadhaar-kyc")} />
            <KycDocumentStepCard title="USDT wallet link" subtitle="Demo wallet connection only" icon="wallet-outline" status={kycData?.walletStatus === "LINKED" ? "VERIFIED" : "PENDING"} maskedDetail={kycData?.walletNetwork ? `${kycData.walletNetwork} linked` : "Tap to link a demo wallet"} onPress={() => router.push("/usdt-wallet")} />
            <Text style={styles.section}>COMING LATER</Text>
            <View style={styles.infoCard}><Ionicons name="lock-closed-outline" size={20} color="#64748B" /><Text style={styles.infoText}>PAN, bank account verification and withdrawal controls will be added only after the approved production providers are integrated.</Text></View>
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FFFFFF" }, screen: { flex: 1, backgroundColor: "#F8FAFC" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12, backgroundColor: "#FFFFFF", borderBottomWidth: 1, borderBottomColor: "#EDF2F7" }, backBtn: { padding: 6 }, headerTitle: { fontSize: 16, fontWeight: "900", color: "#0F172A" },
  loading: { flex: 1, alignItems: "center", justifyContent: "center" }, content: { padding: 16, paddingBottom: 30 }, hero: { flexDirection: "row", borderRadius: 18, padding: 16, gap: 12, marginBottom: 18, borderWidth: 1 }, heroVerified: { backgroundColor: "#E6FBF3", borderColor: "#A7F3D0" }, heroPending: { backgroundColor: "#FFFBEB", borderColor: "#FDE68A" }, heroText: { flex: 1 }, heroTitle: { fontSize: 14, fontWeight: "900", color: "#0F172A" }, heroSub: { fontSize: 11.5, lineHeight: 16, color: "#475569", marginTop: 3 },
  section: { fontSize: 11, fontWeight: "800", color: "#64748B", letterSpacing: .8, marginBottom: 10, marginTop: 6 }, infoCard: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#FFFFFF", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#EDF2F7" }, infoText: { flex: 1, fontSize: 12, lineHeight: 18, color: "#64748B" },
});
