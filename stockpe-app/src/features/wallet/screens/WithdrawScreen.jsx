import React from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useWalletWithdraw } from "../hooks/useWalletWithdraw";
import WithdrawalAccountCard from "../components/WithdrawalAccountCard";
import TdsSummaryCard from "../components/TdsSummaryCard";
import WalletSuccessModal from "../components/WalletSuccessModal";

export default function WithdrawScreen() {
  const router = useRouter();
  const {
    wallet,
    amount,
    setAmount,
    usdtEquivalent,
    accounts,
    selectedAccountId,
    setSelectedAccountId,
    selectedNetwork,
    setSelectedNetwork,
    customAddress,
    setCustomAddress,
    activeNetwork,
    gasFeeUsdt,
    netPayoutUsdt,
    tdsCalculation,
    isValidAmount,
    handleSetMaxAmount,
    handleWithdrawSubmit,
    isProcessing,
    errorMessage,
    withdrawResult,
    showSuccessModal,
    setShowSuccessModal,
    showAddAccountModal,
    setShowAddAccountModal,
  } = useWalletWithdraw();

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
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={22} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>USDT Crypto Withdrawal</Text>
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
          {/* Withdrawable Balance Info Card */}
          <View style={styles.balanceCard}>
            <View style={styles.balanceTop}>
              <View>
                <Text style={styles.balanceLabel}>WITHDRAWABLE WINNINGS</Text>
                <Text style={styles.balanceAmount}>
                  ${wallet.winningsBalanceUsdt.toFixed(2)} USDT
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleSetMaxAmount}
                style={styles.maxBtn}
                activeOpacity={0.8}
              >
                <Text style={styles.maxBtnText}>WITHDRAW ALL</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.balanceDivider} />
            <View style={styles.balanceBreakdown}>
              <Text style={styles.breakdownItem}>
                Deposit Balance: ${wallet.depositBalanceUsdt.toFixed(2)} USDT
              </Text>
              <Text style={styles.breakdownItem}>
                Bonus: ${wallet.bonusBalanceUsdt.toFixed(2)} USDT
              </Text>
            </View>
          </View>

          {/* Withdrawal Amount Input Card */}
          <View style={styles.inputCard}>
            <View style={styles.inputHeader}>
              <Text style={styles.cardLabel}>ENTER WITHDRAWAL AMOUNT</Text>
              <Text style={styles.usdtEquiv}>≈ ₹{parseFloat(amount || 0).toLocaleString("en-IN")}</Text>
            </View>

            <View style={styles.inputBox}>
              <Text style={styles.currency}>$</Text>
              <TextInput
                style={styles.input}
                value={usdtEquivalent}
                onChangeText={(val) => {
                  const num = parseFloat(val) || 0;
                  setAmount(String(Math.round(num * 73.42)));
                }}
                keyboardType="numeric"
                placeholder="0.00"
                placeholderTextColor="#94A3B8"
                maxLength={8}
              />
              <Text style={styles.usdtUnitText}>USDT</Text>
            </View>

            <View style={styles.limitsRow}>
              <Text style={styles.limitsText}>
                Min: ${wallet.minDepositUsdt || 10} USDT • Max Daily: ${wallet.maxWithdrawDailyUsdt?.toLocaleString() || "10,000"} USDT
              </Text>
            </View>
          </View>

          {/* Saved Accounts & Methods */}
          <WithdrawalAccountCard
            accounts={accounts}
            selectedAccountId={selectedAccountId}
            onSelectAccount={setSelectedAccountId}
            onOpenAddAccount={() => setShowAddAccountModal(true)}
          />

          {/* USDT Payout & Gas Fee Breakdown Card */}
          <TdsSummaryCard tdsCalculation={tdsCalculation} />

          {errorMessage ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={16} color="#EF4444" />
              <Text style={styles.errorBoxText}>{errorMessage}</Text>
            </View>
          ) : null}

          {/* Blockchain Compliance Note */}
          <View style={styles.complianceBox}>
            <Ionicons name="shield-checkmark-outline" size={18} color="#00C987" />
            <Text style={styles.complianceText}>
              Crypto payouts are dispatched directly on-chain via smart contracts. Funds arrive after 1-3 network block confirmations.
            </Text>
          </View>
        </ScrollView>

        {/* Sticky Bottom Bar */}
        <View style={styles.bottomBar}>
          <View style={styles.summaryLeft}>
            <Text style={styles.summaryLabel}>YOU RECEIVE (NET)</Text>
            <Text style={styles.summaryAmount}>
              ${netPayoutUsdt} USDT
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.withdrawBtn,
              (!isValidAmount || isProcessing) && styles.withdrawBtnDisabled,
            ]}
            onPress={handleWithdrawSubmit}
            disabled={!isValidAmount || isProcessing}
            activeOpacity={0.85}
          >
            {isProcessing ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <View style={styles.withdrawBtnContent}>
                <Text style={styles.withdrawBtnText}>CONFIRM PAYOUT</Text>
                <Ionicons name="arrow-up" size={18} color="#FFFFFF" />
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Success Modal */}
        <WalletSuccessModal
          visible={showSuccessModal}
          onClose={handleModalClose}
          type="withdraw"
          data={withdrawResult}
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
    backgroundColor: "#0F172A",
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
  },
  balanceTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  balanceLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "#94A3B8",
    letterSpacing: 0.6,
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: "900",
    color: "#00C987",
    marginTop: 2,
  },
  maxBtn: {
    backgroundColor: "#1E293B",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#334155",
  },
  maxBtnText: {
    fontSize: 10,
    fontWeight: "900",
    color: "#00C987",
    letterSpacing: 0.5,
  },
  balanceDivider: {
    height: 1,
    backgroundColor: "#1E293B",
    marginVertical: 12,
  },
  balanceBreakdown: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  breakdownItem: {
    fontSize: 11,
    fontWeight: "600",
    color: "#94A3B8",
  },
  inputCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#EDF2F7",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 18,
  },
  inputHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#64748B",
    letterSpacing: 0.8,
  },
  usdtEquiv: {
    fontSize: 11.5,
    fontWeight: "700",
    color: "#00C987",
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    marginBottom: 10,
  },
  currency: {
    fontSize: 32,
    fontWeight: "900",
    color: "#0F172A",
    marginRight: 6,
  },
  input: {
    flex: 1,
    fontSize: 32,
    fontWeight: "900",
    color: "#0F172A",
    padding: 0,
  },
  limitsRow: {
    flexDirection: "row",
    justifyContent: "center",
  },
  limitsText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#94A3B8",
  },
  complianceBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#F1F5F9",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  complianceText: {
    flex: 1,
    fontSize: 11.5,
    color: "#64748B",
    lineHeight: 16,
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
    fontSize: 22,
    fontWeight: "900",
    color: "#00C987",
  },
  withdrawBtn: {
    backgroundColor: "#F59E0B",
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 170,
  },
  withdrawBtnDisabled: {
    backgroundColor: "#CBD5E1",
  },
  withdrawBtnContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  withdrawBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 0.6,
  },
});
