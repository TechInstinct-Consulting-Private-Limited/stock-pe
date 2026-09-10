import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function PredictionItemCard({ prediction }) {
  const isLive = prediction.status === "LIVE";
  const isWon = prediction.status === "WON";
  const isLost = prediction.status === "LOST";

  return (
    <View style={styles.card}>
      {/* Top Header */}
      <View style={styles.topRow}>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{prediction.category}</Text>
        </View>

        <View
          style={[
            styles.statusBadge,
            isLive && styles.statusLive,
            isWon && styles.statusWon,
            isLost && styles.statusLost,
          ]}
        >
          {isLive && <View style={styles.liveDot} />}
          <Text
            style={[
              styles.statusText,
              isLive && styles.statusLiveText,
              isWon && styles.statusWonText,
              isLost && styles.statusLostText,
            ]}
          >
            {prediction.status}
          </Text>
        </View>
      </View>

      {/* Event Question */}
      <Text style={styles.eventTitle}>{prediction.eventTitle}</Text>

      {/* Choice Pill */}
      <View style={styles.choiceRow}>
        <View
          style={[
            styles.choicePill,
            prediction.choice === "YES" ? styles.yesPill : styles.noPill,
          ]}
        >
          <Text
            style={[
              styles.choiceText,
              prediction.choice === "YES" ? styles.yesText : styles.noText,
            ]}
          >
            PREDICTION: {prediction.choice}
          </Text>
        </View>
        <Text style={styles.qtyText}>
          {prediction.quantity} Contracts @ ₹{prediction.avgPrice}
        </Text>
      </View>

      <View style={styles.divider} />

      {/* Financials Row */}
      <View style={styles.bottomRow}>
        <View>
          <Text style={styles.metaLabel}>INVESTED</Text>
          <Text style={styles.metaVal}>₹{prediction.investedInr}</Text>
        </View>

        <View>
          <Text style={styles.metaLabel}>
            {isLive ? "CURRENT VALUE" : "PAYOUT"}
          </Text>
          <Text style={styles.metaVal}>
            ₹{isLive ? prediction.currentValueInr : prediction.payoutInr}
          </Text>
        </View>

        <View style={styles.pnlBox}>
          <Text style={styles.metaLabel}>RETURNS (P&L)</Text>
          <View style={styles.pnlRow}>
            <Ionicons
              name={prediction.isProfit ? "trending-up" : "trending-down"}
              size={14}
              color={prediction.isProfit ? "#00C987" : "#EF4444"}
            />
            <Text
              style={[
                styles.pnlText,
                { color: prediction.isProfit ? "#00C987" : "#EF4444" },
              ]}
            >
              {prediction.pnlInr >= 0 ? `+₹${prediction.pnlInr}` : `-₹${Math.abs(prediction.pnlInr)}`} ({prediction.pnlPercent})
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#EDF2F7",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  categoryBadge: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#64748B",
    letterSpacing: 0.5,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  statusLive: {
    backgroundColor: "#E6FBF3",
  },
  statusWon: {
    backgroundColor: "#FEF3C7",
  },
  statusLost: {
    backgroundColor: "#FEE2E2",
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#00C987",
  },
  statusText: {
    fontSize: 9.5,
    fontWeight: "900",
  },
  statusLiveText: {
    color: "#00C987",
  },
  statusWonText: {
    color: "#D97706",
  },
  statusLostText: {
    color: "#EF4444",
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
    lineHeight: 20,
    marginBottom: 10,
  },
  choiceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  choicePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  yesPill: {
    backgroundColor: "#E6FBF3",
  },
  noPill: {
    backgroundColor: "#FEE2E2",
  },
  choiceText: {
    fontSize: 11,
    fontWeight: "900",
  },
  yesText: {
    color: "#00C987",
  },
  noText: {
    color: "#EF4444",
  },
  qtyText: {
    fontSize: 11.5,
    fontWeight: "600",
    color: "#64748B",
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 12,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  metaLabel: {
    fontSize: 9.5,
    fontWeight: "800",
    color: "#94A3B8",
    letterSpacing: 0.4,
  },
  metaVal: {
    fontSize: 13,
    fontWeight: "900",
    color: "#0F172A",
    marginTop: 2,
  },
  pnlBox: {
    alignItems: "flex-end",
  },
  pnlRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  pnlText: {
    fontSize: 12,
    fontWeight: "900",
  },
});
