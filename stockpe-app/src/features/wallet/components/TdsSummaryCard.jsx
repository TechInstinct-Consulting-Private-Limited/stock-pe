import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function TdsSummaryCard({ tdsCalculation }) {
  const { grossAmount, grossUsdt, gasFeeUsdt, netPayoutUsdt, netPayoutInr, network } =
    tdsCalculation;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Ionicons name="receipt-outline" size={16} color="#64748B" />
        <Text style={styles.sectionTitle}>USDT PAYOUT & NETWORK FEE BREAKDOWN</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.rowLabel}>Gross Withdrawal Amount</Text>
        <Text style={styles.rowValue}>${grossUsdt} USDT (₹{grossAmount.toLocaleString("en-IN")})</Text>
      </View>

      <View style={styles.row}>
        <View style={styles.tdsLabelRow}>
          <Text style={styles.rowLabel}>Blockchain Gas Fee ({network || "TRC-20"})</Text>
          <View style={styles.infoBadge}>
            <Text style={styles.infoBadgeText}>On-Chain</Text>
          </View>
        </View>
        <Text style={[styles.rowValue, { color: "#F59E0B" }]}>
          -${gasFeeUsdt} USDT
        </Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.rowLabel}>Platform Commission</Text>
        <Text style={[styles.rowValue, { color: "#00C987" }]}>$0.00 (0% Free)</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.totalRow}>
        <View>
          <Text style={styles.netLabel}>NET USDT RECEIVED</Text>
          <Text style={styles.netSub}>Estimated in ~1-3 mins</Text>
        </View>
        <View style={styles.amountRight}>
          <Text style={styles.netAmount}>
            ${netPayoutUsdt} USDT
          </Text>
          <Text style={styles.netUsdt}>≈ ₹{netPayoutInr?.toLocaleString("en-IN")}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#EDF2F7",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "900",
    color: "#0F172A",
    letterSpacing: 0.8,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  tdsLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  infoBadge: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  infoBadgeText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#64748B",
  },
  rowLabel: {
    fontSize: 12.5,
    color: "#475569",
    fontWeight: "600",
  },
  rowValue: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0F172A",
  },
  divider: {
    height: 1,
    backgroundColor: "#EDF2F7",
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  netLabel: {
    fontSize: 12,
    fontWeight: "900",
    color: "#0F172A",
    letterSpacing: 0.5,
  },
  netSub: {
    fontSize: 10.5,
    color: "#00C987",
    fontWeight: "700",
    marginTop: 2,
  },
  amountRight: {
    alignItems: "flex-end",
  },
  netAmount: {
    fontSize: 20,
    fontWeight: "900",
    color: "#00C987",
  },
  netUsdt: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748B",
  },
});

