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
  } = useWalletDeposit();

  const handleModalClose = () => {
    setShowSuccessModal(false);
    router.back();
  };

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Top App Header */}
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
          {/* Current Balance Card */}
          <View style={styles.balanceCard}>
            <View>
              <Text style={styles.balanceLabel}>CURRENT WALLET BALANCE</Text>
              <Text style={styles.balanceAmount}>
                ${wallet.totalBalanceUsdt.toFixed(2)} USDT
              </Text>
            </View>
            <View style={styles.balanceUsdtPill}>
              <Text style={styles.balanceUsdtText}>
                ≈ ₹{wallet.totalBalanceInr.toLocaleString("en-IN")}
              </Text>
            </View>
          </View>

          {/* 1. Deposit Amount Input & Chips */}
          <DepositAmountInput
            amount={amount}
            setAmount={setAmount}
            usdtEquivalent={usdtEquivalent}
            quickAmounts={quickAmounts}
            onSelectQuickAmount={handleSelectQuickAmount}
          />

          {/* 2. Promo / Offers Card */}
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

          {/* 3. USDT Crypto Deposit Hub */}
          <PaymentMethodSelector
            selectedNetwork={selectedNetwork}
            onSelectNetwork={setSelectedNetwork}
            txHash={txHash}
            setTxHash={setTxHash}
          />

          {/* 4. Security & Instant Badge */}
          <View style={styles.securityBox}>
            <Ionicons name="shield-checkmark" size={18} color="#00C987" />
            <Text style={styles.securityText}>
              Decentralized On-Chain Verification • Instant Crediting
            </Text>
          </View>

          {errorMessage ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={16} color="#EF4444" />
              <Text style={styles.errorBoxText}>{errorMessage}</Text>
            </View>
          ) : null}
        </ScrollView>

        {/* Sticky Bottom Summary & CTA */}
        <View style={styles.bottomBar}>
          <View style={styles.summaryLeft}>
            <Text style={styles.summaryLabel}>TOTAL DEPOSIT CREDIT</Text>
            <Text style={styles.summaryAmount}>
              ${totalEffectiveCreditUsdt} USDT
            </Text>
            <Text style={styles.summaryBonusText}>
              ≈ ₹{totalEffectiveCredit.toLocaleString("en-IN")} {calculatedBonus > 0 ? `(+${calculatedBonusUsdt} USDT Bonus)` : ""}
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
                <Text style={styles.payBtnText}>CONFIRM DEPOSIT</Text>
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
  historyBtn: {
    padding: 6,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  balanceCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#0F172A",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  balanceLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "#94A3B8",
    letterSpacing: 0.6,
  },
  balanceAmount: {
    fontSize: 22,
    fontWeight: "900",
    color: "#FFFFFF",
    marginTop: 2,
  },
  balanceUsdtPill: {
    backgroundColor: "#1E293B",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#334155",
  },
  balanceUsdtText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#00C987",
  },
  securityBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#E6FBF3",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 16,
  },
  securityText: {
    fontSize: 11.5,
    fontWeight: "700",
    color: "#059669",
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FEE2E2",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  errorBoxText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#EF4444",
  },
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: "#EDF2F7",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 6,
  },
  summaryLeft: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "#64748B",
    letterSpacing: 0.6,
  },
  summaryAmount: {
    fontSize: 20,
    fontWeight: "900",
    color: "#0F172A",
  },
  summaryBonusText: {
    fontSize: 10.5,
    fontWeight: "800",
    color: "#00C987",
  },
  payBtn: {
    backgroundColor: "#00C987",
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 160,
  },
  payBtnDisabled: {
    backgroundColor: "#CBD5E1",
  },
  payBtnContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  payBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 0.6,
  },
});
