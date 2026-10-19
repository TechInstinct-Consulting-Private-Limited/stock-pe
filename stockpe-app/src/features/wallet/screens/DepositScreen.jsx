import React from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useWalletDeposit } from "../hooks/useWalletDeposit";
import DepositAmountInput from "../components/DepositAmountInput";
import PaymentMethodSelector from "../components/PaymentMethodSelector";
import PromoCouponCard from "../components/PromoCouponCard";
import WalletSuccessModal from "../components/WalletSuccessModal";

export default function DepositScreen() {
  const router = useRouter();

  const {
    wallet,
    amount,
    setAmount,
    numAmount,
    usdtEquivalent,
    quickAmounts,
    handleSelectQuickAmount,
    selectedNetwork,
    setSelectedNetwork,
    txHash,
    setTxHash,
    promoCoupons,
    couponCode,
    setCouponCode,
    appliedCoupon,
    couponError,
    isApplyingCoupon,
    calculatedBonus,
    calculatedBonusUsdt,
    totalEffectiveCredit,
    totalEffectiveCreditUsdt,
    handleApplyCoupon,
    handleRemoveCoupon,
    handleDepositSubmit,
    isProcessing,
    errorMessage,
    showSuccessModal,
    setShowSuccessModal,
    depositResult,
    orderStatus,
    isSimulating,
    handleSimulateConfirm,
    handleResetOrder,
  } = useWalletDeposit();

  const handleModalClose = () => {
    setShowSuccessModal(false);
    handleResetOrder();
    router.back();
  };

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
          <Text style={styles.headerTitle}>USDT Crypto Deposit</Text>
          <TouchableOpacity
            onPress={() => router.push("/wallet/history")}
            style={styles.historyBtn}
            activeOpacity={0.7}
          >
            <Ionicons name="time-outline" size={22} color="#64748B" />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Balance Card */}
          <View style={styles.balanceCard}>
            <View>
              <Text style={styles.balanceLabel}>CURRENT WALLET BALANCE</Text>
              <Text style={styles.balanceAmount}>
                ${wallet.totalBalanceUsdt.toFixed(2)} USDT
              </Text>
            </View>
            <View style={styles.balanceUsdtPill}>
              <Text style={styles.balanceUsdtText}>
                ≈ ₹{Math.round(wallet.totalBalanceInr).toLocaleString("en-IN")}
              </Text>
            </View>
          </View>

          {/* Active Deposit Order Banner (When payment is in progress) */}
          {depositResult && (
            <View style={styles.activeBanner}>
              <View style={styles.activeBannerTop}>
                <View style={styles.statusPulse}>
                  {orderStatus === "finished" ? (
                    <Ionicons name="checkmark-circle" size={16} color="#00C987" />
                  ) : (
                    <ActivityIndicator size="small" color="#F59E0B" />
                  )}
                  <Text
                    style={[
                      styles.statusTitle,
                      orderStatus === "finished" && { color: "#00C987" },
                    ]}
                  >
                    {orderStatus === "finished"
                      ? "DEPOSIT CONFIRMED"
                      : "AWAITING ON-CHAIN TRANSFER..."}
                  </Text>
                </View>
                <Text style={styles.orderId}>#{depositResult.paymentId}</Text>
              </View>

              <Text style={styles.sandboxHint}>
                ⚡ NOWPayments Sandbox: Auto-simulating in ~40s.
              </Text>

              <TouchableOpacity
                style={styles.instantBtn}
                onPress={handleSimulateConfirm}
                disabled={isSimulating}
                activeOpacity={0.8}
              >
                {isSimulating ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.instantBtnText}>
                    ⚡ INSTANT CONFIRM (SKIP 40s WAIT)
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* 1. Deposit Amount Input */}
          <DepositAmountInput
            amount={amount}
            setAmount={setAmount}
            usdtEquivalent={usdtEquivalent}
            quickAmounts={quickAmounts}
            onSelectQuickAmount={handleSelectQuickAmount}
          />

          {/* 2. Promo Coupons */}
          <PromoCouponCard
            couponCode={couponCode}
            setCouponCode={setCouponCode}
            appliedCoupon={appliedCoupon}
            couponError={couponError}
            isApplyingCoupon={isApplyingCoupon}
            onApplyCoupon={handleApplyCoupon}
            onRemoveCoupon={handleRemoveCoupon}
            promoCoupons={promoCoupons}
          />

          {/* 3. DRY USDT Payment Hub (Reuses existing QR, Network & Copy components) */}
          <PaymentMethodSelector
            selectedNetwork={selectedNetwork}
            onSelectNetwork={setSelectedNetwork}
            txHash={txHash}
            setTxHash={setTxHash}
            liveDepositAddress={depositResult?.depositAddress}
            isSandbox={true}
          />

          {errorMessage ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={16} color="#EF4444" />
              <Text style={styles.errorBoxText}>{errorMessage}</Text>
            </View>
          ) : null}
        </ScrollView>

        {/* Sticky Bottom Bar */}
        <View style={styles.bottomBar}>
          <View style={styles.summaryLeft}>
            <Text style={styles.summaryLabel}>TOTAL DEPOSIT CREDIT</Text>
            <Text style={styles.summaryAmount}>
              ${totalEffectiveCreditUsdt} USDT
            </Text>
            <Text style={styles.summaryBonusText}>
              ≈ ₹{totalEffectiveCredit.toLocaleString("en-IN")}{" "}
              {calculatedBonus > 0 ? `(+${calculatedBonusUsdt} USDT Bonus)` : ""}
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.payBtn,
              (numAmount <= 0 || isProcessing) && styles.payBtnDisabled,
            ]}
            onPress={handleDepositSubmit}
            disabled={numAmount <= 0 || isProcessing}
            activeOpacity={0.85}
          >
            {isProcessing ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <View style={styles.payBtnContent}>
                <Text style={styles.payBtnText}>
                  {depositResult ? "REFRESH DEPOSIT" : "PROCEED TO DEPOSIT"}
                </Text>
                <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Success Modal */}
        <WalletSuccessModal
          visible={showSuccessModal}
          onClose={handleModalClose}
          type="deposit"
          data={depositResult}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FFFFFF" },
  screen: { flex: 1, backgroundColor: "#F8FAFC" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 16, fontWeight: "800", color: "#0F172A" },
  historyBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 30 },
  balanceCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#EDF2F7",
  },
  balanceLabel: { fontSize: 9.5, fontWeight: "800", color: "#64748B" },
  balanceAmount: { fontSize: 22, fontWeight: "900", color: "#0F172A" },
  balanceUsdtPill: {
    backgroundColor: "#E6FBF3",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  balanceUsdtText: { fontSize: 12, fontWeight: "800", color: "#059669" },
  activeBanner: {
    backgroundColor: "#FFFBEB",
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  activeBannerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusPulse: { flexDirection: "row", alignItems: "center", gap: 6 },
  statusTitle: { fontSize: 11, fontWeight: "900", color: "#D97706" },
  orderId: { fontSize: 10, fontWeight: "700", color: "#64748B" },
  sandboxHint: { fontSize: 11, color: "#92400E", marginVertical: 8 },
  instantBtn: {
    backgroundColor: "#00C987",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  instantBtnText: { fontSize: 11.5, fontWeight: "900", color: "#FFFFFF" },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FEF2F2",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  errorBoxText: { fontSize: 12, color: "#DC2626", fontWeight: "600", flex: 1 },
  bottomBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: "#EDF2F7",
  },
  summaryLeft: { flex: 1 },
  summaryLabel: { fontSize: 9, fontWeight: "800", color: "#64748B" },
  summaryAmount: { fontSize: 20, fontWeight: "900", color: "#0F172A" },
  summaryBonusText: { fontSize: 11, color: "#059669", fontWeight: "700" },
  payBtn: {
    backgroundColor: "#00C987",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 14,
  },
  payBtnDisabled: { backgroundColor: "#CBD5E1" },
  payBtnContent: { flexDirection: "row", alignItems: "center", gap: 6 },
  payBtnText: { fontSize: 13, fontWeight: "900", color: "#FFFFFF" },
});
