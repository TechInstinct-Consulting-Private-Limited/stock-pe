import React from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useProfileKyc } from "../hooks/useProfileKyc";
import KycDocumentStepCard from "../components/KycDocumentStepCard";

export default function KycScreen() {
  const router = useRouter();
  const {
    kycData,
    activeStep,
    setActiveStep,
    panNumber,
    setPanNumber,
    panName,
    setPanName,
    dob,
    setDob,
    panError,
    isSubmittingPan,
    handleVerifyPan,
    aadhaarNumber,
    setAadhaarNumber,
    aadhaarOtp,
    setAadhaarOtp,
    otpSent,
    handleSendAadhaarOtp,
    aadhaarError,
    isSubmittingAadhaar,
    handleVerifyAadhaar,
    biometricsEnabled,
    setBiometricsEnabled,
    twoFactorEnabled,
    setTwoFactorEnabled,
    successMessage,
  } = useProfileKyc();

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={22} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>KYC & Security</Text>
          <View style={{ width: 34 }} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Status Hero Banner */}
          <View style={styles.heroBanner}>
            <View style={styles.heroIconBox}>
              <Ionicons name="shield-checkmark" size={28} color="#00C987" />
            </View>
            <View style={styles.heroTextContainer}>
              <View style={styles.heroStatusRow}>
                <Text style={styles.heroTitle}>KYC Level: 100% Verified</Text>
                <View style={styles.verifiedBadge}>
                  <Text style={styles.verifiedBadgeText}>ACTIVE</Text>
                </View>
              </View>
              <Text style={styles.heroSub}>
                Your identity and bank account are verified for instant unlimited deposits and withdrawals.
              </Text>
            </View>
          </View>

          {successMessage ? (
            <View style={styles.successBanner}>
              <Ionicons name="checkmark-circle" size={18} color="#00C987" />
              <Text style={styles.successBannerText}>{successMessage}</Text>
            </View>
          ) : null}

          {/* Section: Documents */}
          <Text style={styles.sectionHeader}>IDENTITY DOCUMENTS</Text>

          {/* PAN Step Card */}
          <KycDocumentStepCard
            title="PAN Card Verification"
            subtitle="Required for TDS compliance & payouts"
            icon="card-outline"
            status={kycData.panStatus}
            maskedDetail={
              kycData.panStatus === "VERIFIED"
                ? `PAN: ${kycData.panNumberMasked} (${kycData.panHolderName})`
                : "Tap to link PAN Card"
            }
            onPress={() => {
              if (kycData.panStatus !== "VERIFIED") setActiveStep("PAN");
            }}
          />

          {/* Aadhaar Step Card */}
          <KycDocumentStepCard
            title="Aadhaar DigiLocker"
            subtitle="Govt Instant OTP Verification"
            icon="finger-print-outline"
            status={kycData.aadhaarStatus}
            maskedDetail={
              kycData.aadhaarStatus === "VERIFIED"
                ? `Aadhaar: ${kycData.aadhaarNumberMasked}`
                : "Tap to verify via OTP"
            }
            onPress={() => {
              if (kycData.aadhaarStatus !== "VERIFIED") setActiveStep("AADHAAR");
            }}
          />

          {/* Bank Account Step Card */}
          <KycDocumentStepCard
            title="Bank Account Payouts"
            subtitle="Penny Drop Verified"
            icon="business-outline"
            status={kycData.bankStatus}
            maskedDetail={`${kycData.bankName} • ${kycData.bankAccountMasked}`}
            onPress={() => router.push("/wallet/withdraw")}
          />

          {/* Section: Security & Access */}
          <Text style={styles.sectionHeader}>APP SECURITY & ACCESS</Text>

          <View style={styles.securityCard}>
            <View style={styles.securityRow}>
              <View style={styles.securityLeft}>
                <Ionicons name="finger-print" size={20} color="#6366F1" />
                <View>
                  <Text style={styles.securityTitle}>Biometric Authentication</Text>
                  <Text style={styles.securitySub}>
                    Unlock trades and withdrawals with Face ID / Fingerprint
                  </Text>
                </View>
              </View>
              <Switch
                value={biometricsEnabled}
                onValueChange={setBiometricsEnabled}
                trackColor={{ false: "#CBD5E1", true: "#A7F3D0" }}
                thumbColor={biometricsEnabled ? "#00C987" : "#F8FAFC"}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.securityRow}>
              <View style={styles.securityLeft}>
                <Ionicons name="key" size={20} color="#F59E0B" />
                <View>
                  <Text style={styles.securityTitle}>Two-Factor SMS / OTP</Text>
                  <Text style={styles.securitySub}>
                    Require OTP confirmation for every payout request
                  </Text>
                </View>
              </View>
              <Switch
                value={twoFactorEnabled}
                onValueChange={setTwoFactorEnabled}
                trackColor={{ false: "#CBD5E1", true: "#A7F3D0" }}
                thumbColor={twoFactorEnabled ? "#00C987" : "#F8FAFC"}
              />
            </View>
          </View>
        </ScrollView>

        {/* PAN Verification Modal */}
        {activeStep === "PAN" && (
          <Modal
            animationType="slide"
            transparent={true}
            visible={activeStep === "PAN"}
            onRequestClose={() => setActiveStep(null)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalCard}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>PAN Card Verification</Text>
                  <TouchableOpacity onPress={() => setActiveStep(null)}>
                    <Ionicons name="close" size={20} color="#64748B" />
                  </TouchableOpacity>
                </View>

                <Text style={styles.modalDesc}>
                  Enter your 10-digit Permanent Account Number (PAN) as per Income Tax records.
                </Text>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>PAN NUMBER</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="e.g. ABCDE1234F"
                    placeholderTextColor="#94A3B8"
                    value={panNumber}
                    onChangeText={(t) => setPanNumber(t.toUpperCase())}
                    autoCapitalize="characters"
                    maxLength={10}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>FULL NAME (ON PAN)</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="e.g. ARJUN KUMAR"
                    placeholderTextColor="#94A3B8"
                    value={panName}
                    onChangeText={setPanName}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>DATE OF BIRTH</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="DD/MM/YYYY"
                    placeholderTextColor="#94A3B8"
                    value={dob}
                    onChangeText={setDob}
                  />
                </View>

                {panError ? <Text style={styles.errorText}>{panError}</Text> : null}

                <TouchableOpacity
                  style={styles.modalSubmitBtn}
                  onPress={handleVerifyPan}
                  disabled={isSubmittingPan}
                >
                  {isSubmittingPan ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.modalSubmitBtnText}>VERIFY PAN INSTANTLY</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        )}

        {/* Aadhaar Verification Modal */}
        {activeStep === "AADHAAR" && (
          <Modal
            animationType="slide"
            transparent={true}
            visible={activeStep === "AADHAAR"}
            onRequestClose={() => setActiveStep(null)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalCard}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Aadhaar DigiLocker</Text>
                  <TouchableOpacity onPress={() => setActiveStep(null)}>
                    <Ionicons name="close" size={20} color="#64748B" />
                  </TouchableOpacity>
                </View>

                <Text style={styles.modalDesc}>
                  Enter your 12-digit Aadhaar to receive an OTP on your UIDAI registered mobile number.
                </Text>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>AADHAAR NUMBER</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="12-digit Aadhaar Number"
                    placeholderTextColor="#94A3B8"
                    value={aadhaarNumber}
                    onChangeText={setAadhaarNumber}
                    keyboardType="numeric"
                    maxLength={12}
                  />
                </View>

                {otpSent ? (
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>ENTER 6-DIGIT OTP</Text>
                    <TextInput
                      style={styles.modalInput}
                      placeholder="• • • • • •"
                      placeholderTextColor="#94A3B8"
                      value={aadhaarOtp}
                      onChangeText={setAadhaarOtp}
                      keyboardType="numeric"
                      maxLength={6}
                    />
                  </View>
                ) : null}

                {aadhaarError ? (
                  <Text style={styles.errorText}>{aadhaarError}</Text>
                ) : null}

                {!otpSent ? (
                  <>
                    <TouchableOpacity
                      style={styles.modalSubmitBtn}
                      onPress={handleSendAadhaarOtp}
                    >
                      <Text style={styles.modalSubmitBtnText}>GET OTP</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.modalSubmitBtn, { backgroundColor: "#EFF6FF", borderWidth: 1, borderColor: "#BFDBFE", marginTop: 8 }]}
                      onPress={() => {
                        setActiveStep(null);
                        router.push("/aadhaar");
                      }}
                    >
                      <Text style={[styles.modalSubmitBtnText, { color: "#2563EB" }]}>📷 SCAN AADHAAR QR CODE</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <TouchableOpacity
                    style={styles.modalSubmitBtn}
                    onPress={handleVerifyAadhaar}
                    disabled={isSubmittingAadhaar}
                  >
                    {isSubmittingAadhaar ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <Text style={styles.modalSubmitBtnText}>CONFIRM & VERIFY</Text>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </Modal>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  screen: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#EDF2F7",
  },
  backBtn: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#0F172A",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  heroBanner: {
    flexDirection: "row",
    backgroundColor: "#E6FBF3",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: "#A7F3D0",
    marginBottom: 18,
    alignItems: "center",
  },
  heroIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  heroTextContainer: {
    flex: 1,
  },
  heroStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  heroTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: "#059669",
  },
  verifiedBadge: {
    backgroundColor: "#00C987",
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  verifiedBadgeText: {
    fontSize: 8.5,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  heroSub: {
    fontSize: 11.5,
    color: "#047857",
    marginTop: 3,
    lineHeight: 16,
  },
  successBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#E6FBF3",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  successBannerText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#00C987",
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: "800",
    color: "#64748B",
    letterSpacing: 0.8,
    marginBottom: 10,
    marginTop: 6,
  },
  securityCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#EDF2F7",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 16,
  },
  securityRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  securityLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
    marginRight: 12,
  },
  securityTitle: {
    fontSize: 13.5,
    fontWeight: "800",
    color: "#0F172A",
  },
  securitySub: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 2,
    lineHeight: 15,
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.7)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 36,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: "#0F172A",
  },
  modalDesc: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 16,
    lineHeight: 16,
  },
  inputContainer: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "#64748B",
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  modalInput: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },
  errorText: {
    color: "#EF4444",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 12,
  },
  modalSubmitBtn: {
    backgroundColor: "#00C987",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 8,
  },
  modalSubmitBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 0.6,
  },
});
