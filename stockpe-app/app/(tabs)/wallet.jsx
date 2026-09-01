import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

export default function WalletScreen() {
  const quickActions = [
    {
      id: "scan",
      label: "Scan QR",
      icon: "qr-code-outline",
      iconColor: "#059669",
      bgColor: "#ECFDF5",
    },
    {
      id: "deposit",
      label: "Deposit",
      icon: "arrow-down-outline",
      iconColor: "#00C987",
      bgColor: "#E6FBF3",
    },
    {
      id: "withdraw",
      label: "Withdraw",
      icon: "arrow-up-outline",
      iconColor: "#F59E0B",
      bgColor: "#FEF3C7",
    },
    {
      id: "history",
      label: "History",
      icon: "stats-chart-outline",
      iconColor: "#6366F1",
      bgColor: "#EEF2FF",
    },
  ];

  const transactions = [
    {
      id: "tx-1",
      title: "NIFTY IT Win",
      date: "31 Aug, 11:21 pm",
      status: "Won",
      statusBg: "#FEF3C7",
      statusColor: "#D97706",
      amountInr: "+₹45,000",
      amountUsdt: "+612.24 USDT",
      isCredit: true,
      icon: "arrow-down-outline",
    },
    {
      id: "tx-2",
      title: "SENSEX Event Entry",
      date: "01 Sept, 08:21 pm",
      status: "Success",
      statusBg: "#F1F5F9",
      statusColor: "#64748B",
      amountInr: "-₹199",
      amountUsdt: "-2.71 USDT",
      isCredit: false,
      icon: "arrow-up-outline",
    },
    {
      id: "tx-3",
      title: "USDT Deposit",
      date: "01 Sept, 06:21 pm",
      status: "Confirmed",
      statusBg: "#F1F5F9",
      statusColor: "#64748B",
      amountInr: "+₹1,000",
      amountUsdt: "+13.62 USDT",
      isCredit: true,
      icon: "arrow-down-outline",
    },
    {
      id: "tx-4",
      title: "BANK NIFTY Entry",
      date: "30 Aug, 11:21 pm",
      status: "Success",
      statusBg: "#F1F5F9",
      statusColor: "#64748B",
      amountInr: "-₹299",
      amountUsdt: "-4.07 USDT",
      isCredit: false,
      icon: "arrow-up-outline",
    },
    {
      id: "tx-5",
      title: "NIFTY 50 Win",
      date: "29 Aug, 04:15 pm",
      status: "Won",
      statusBg: "#FEF3C7",
      statusColor: "#D97706",
      amountInr: "+₹12,500",
      amountUsdt: "+170.25 USDT",
      isCredit: true,
      icon: "arrow-down-outline",
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Emerald Gradient Hero Card */}
        <LinearGradient
          colors={["#008A5E", "#044D37", "#062B1F"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.heroTopRow}>
            <View>
              <Text style={styles.balanceLabel}>TOTAL BALANCE</Text>
              <Text style={styles.balanceAmount}>₹1,283.00</Text>
            </View>

            {/* USDT Card */}
            <View style={styles.usdtHeroCard}>
              <View style={styles.usdtHeroIcon}>
                <Text style={styles.usdtHeroIconText}>₮</Text>
              </View>
              <Text style={styles.usdtHeroValue}>17.47</Text>
              <Text style={styles.usdtHeroUnit}>USDT</Text>
            </View>
          </View>

          <Text style={styles.verifiedRateText}>
            1 USDT = ₹73.42{"   "}•{"   "}Verified account
          </Text>

          {/* Action Buttons */}
          <View style={styles.heroActionsRow}>
            <TouchableOpacity
              style={styles.addFundsBtn}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-down-outline" size={16} color="#FFFFFF" />
              <Text style={styles.addFundsText}>ADD FUNDS</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.withdrawBtn}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-up-outline" size={16} color="#FFFFFF" />
              <Text style={styles.withdrawText}>WITHDRAW</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Quick Actions 4-Grid */}
        <View style={styles.quickGrid}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={styles.quickItem}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.quickIconCircle,
                  { backgroundColor: action.bgColor },
                ]}
              >
                <Ionicons
                  name={action.icon}
                  size={22}
                  color={action.iconColor}
                />
              </View>
              <Text style={styles.quickLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Transactions */}
        <View style={styles.transactionsHeader}>
          <Text style={styles.sectionTitle}>RECENT TRANSACTIONS</Text>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.transactionsList}>
          {transactions.map((tx) => (
            <View key={tx.id} style={styles.txCard}>
              {/* Icon */}
              <View
                style={[
                  styles.txIconCircle,
                  tx.isCredit ? styles.txCreditIcon : styles.txDebitIcon,
                ]}
              >
                <Ionicons
                  name={tx.icon}
                  size={18}
                  color={tx.isCredit ? "#00C987" : "#EF4444"}
                />
              </View>

              {/* Middle info */}
              <View style={styles.txMiddle}>
                <Text style={styles.txTitle}>{tx.title}</Text>
                <View style={styles.txSubRow}>
                  <Text style={styles.txDate}>{tx.date}</Text>
                  <View
                    style={[
                      styles.txStatusBadge,
                      { backgroundColor: tx.statusBg },
                    ]}
                  >
                    <Text
                      style={[
                        styles.txStatusText,
                        { color: tx.statusColor },
                      ]}
                    >
                      {tx.status}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Amount Right */}
              <View style={styles.txAmountRight}>
                <Text
                  style={[
                    styles.txAmountInr,
                    tx.isCredit ? styles.creditText : styles.debitText,
                  ]}
                >
                  {tx.amountInr}
                </Text>
                <Text style={styles.txAmountUsdt}>{tx.amountUsdt}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F6FB",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 32,
  },

  /* Hero Gradient Card */
  heroCard: {
    borderRadius: 22,
    padding: 20,
    marginBottom: 18,
    shadowColor: "#008A5E",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 6,
  },
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  balanceLabel: {
    fontSize: 9.5,
    fontWeight: "800",
    color: "#86EFAC",
    letterSpacing: 1,
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 34,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },
  usdtHeroCard: {
    backgroundColor: "#00C987",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 9,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 70,
  },
  usdtHeroIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 3,
  },
  usdtHeroIconText: {
    color: "#00C987",
    fontSize: 12,
    fontWeight: "900",
  },
  usdtHeroValue: {
    fontSize: 13,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  usdtHeroUnit: {
    fontSize: 8.5,
    fontWeight: "800",
    color: "#D1FAE5",
  },
  verifiedRateText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#A7F3D0",
    marginTop: 10,
    marginBottom: 16,
  },
  heroActionsRow: {
    flexDirection: "row",
    gap: 12,
  },
  addFundsBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.22)",
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.35)",
  },
  addFundsText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  withdrawBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.35)",
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  withdrawText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.5,
  },

  /* Quick Actions Grid */
  quickGrid: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E8EDF5",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  quickItem: {
    flex: 1,
    alignItems: "center",
  },
  quickIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  quickLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#475569",
  },

  /* Recent Transactions */
  transactionsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 10.5,
    fontWeight: "900",
    color: "#64748B",
    letterSpacing: 0.8,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#00C987",
  },
  transactionsList: {
    gap: 10,
  },
  txCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: "#E8EDF5",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  txIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  txCreditIcon: {
    backgroundColor: "#E6FBF3",
  },
  txDebitIcon: {
    backgroundColor: "#FEE2E2",
  },
  txMiddle: {
    flex: 1,
  },
  txTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
  },
  txSubRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 2,
  },
  txDate: {
    fontSize: 11,
    fontWeight: "600",
    color: "#94A3B8",
  },
  txStatusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  txStatusText: {
    fontSize: 9,
    fontWeight: "800",
  },
  txAmountRight: {
    alignItems: "flex-end",
  },
  txAmountInr: {
    fontSize: 14.5,
    fontWeight: "900",
  },
  creditText: {
    color: "#00C987",
  },
  debitText: {
    color: "#EF4444",
  },
  txAmountUsdt: {
    fontSize: 10,
    fontWeight: "700",
    color: "#94A3B8",
    marginTop: 1,
  },
});
