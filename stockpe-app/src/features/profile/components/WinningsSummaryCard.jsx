import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function WinningsSummaryCard({ winningsData }) {
  const { totalWinningsInr, totalWinningsUsdt, breakdown, tdsSummary } =
    winningsData;

  return (
    <View style={styles.card}>
      {/* Top Emerald Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.label}>CUMULATIVE WINNINGS</Text>
          <Text style={styles.totalAmount}>
            ₹{totalWinningsInr.toLocaleString("en-IN")}
          </Text>
        </View>
        <View style={styles.usdtPill}>
          <Text style={styles.usdtText}>~{totalWinningsUsdt} USDT</Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Breakdown 2x2 Grid */}
      <View style={styles.grid}>
        <View style={styles.gridItem}>
          <View style={styles.dotContest} />
          <View>
            <Text style={styles.itemLabel}>Fantasy Contests</Text>
            <Text style={styles.itemVal}>
              ₹{breakdown.fantasyContestsInr.toLocaleString("en-IN")}
            </Text>
          </View>
        </View>

        <View style={styles.gridItem}>
          <View style={styles.dotTrading} />
          <View>
            <Text style={styles.itemLabel}>Event Trading</Text>
            <Text style={styles.itemVal}>
              ₹{breakdown.eventTradingInr.toLocaleString("en-IN")}
            </Text>
          </View>
        </View>

        <View style={styles.gridItem}>
          <View style={styles.dotLeader} />
          <View>
            <Text style={styles.itemLabel}>Leaderboard Rewards</Text>
            <Text style={styles.itemVal}>
              ₹{breakdown.leaderboardRewardsInr.toLocaleString("en-IN")}
            </Text>
          </View>
        </View>

        <View style={styles.gridItem}>
          <View style={styles.dotReferral} />
          <View>
            <Text style={styles.itemLabel}>Referral Bonus</Text>
            <Text style={styles.itemVal}>
              ₹{breakdown.referralBonusesInr.toLocaleString("en-IN")}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Tax Info */}
      <View style={styles.taxRow}>
        <View style={styles.taxLeft}>
          <Ionicons name="shield-checkmark" size={16} color="#00C987" />
          <Text style={styles.taxText}>
            FY {tdsSummary.financialYear} • ₹0 TDS Deducted (Within Exemption)
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#0F172A",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    fontSize: 10,
    fontWeight: "800",
    color: "#94A3B8",
    letterSpacing: 0.6,
  },
  totalAmount: {
    fontSize: 26,
    fontWeight: "900",
    color: "#00C987",
    marginTop: 2,
  },
  usdtPill: {
    backgroundColor: "#1E293B",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#334155",
  },
  usdtText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#00C987",
  },
  divider: {
    height: 1,
    backgroundColor: "#1E293B",
    marginVertical: 14,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 12,
  },
  gridItem: {
    width: "50%",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dotContest: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#F59E0B",
  },
  dotTrading: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#00C987",
  },
  dotLeader: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#6366F1",
  },
  dotReferral: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#EC4899",
  },
  itemLabel: {
    fontSize: 10.5,
    color: "#94A3B8",
    fontWeight: "600",
  },
  itemVal: {
    fontSize: 13,
    fontWeight: "900",
    color: "#FFFFFF",
    marginTop: 1,
  },
  taxRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  taxLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  taxText: {
    fontSize: 11,
    color: "#94A3B8",
    fontWeight: "600",
  },
});
