import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

export default function ContestFeedCard({ contest }) {
  const handleOpenContest = () => {
    router.push(`/contest/${contest.id}`);
  };

  const fill = contest.fillPercent || 76;
  const prizeInr = contest.prizePoolInr || "₹5.0L";
  const prizeUsdt = contest.prizePoolUsdt || "68101.40";
  const entryInr = contest.entryFeeInr || "₹49";
  const entryUsdt = contest.entryFeeUsdt || "0.67 USDT";
  const players = contest.filledSpots ? Number(contest.filledSpots).toLocaleString() : "11,420";
  const closesIn = contest.closesIn || "01:45:20";

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={handleOpenContest}
      style={styles.cardWrapper}
    >
      <View style={styles.card}>
        {/* Top Header Row */}
        <View style={styles.headerRow}>
          {/* Top Left: Title, Status, Subtitle */}
          <View style={styles.leftHeaderBlock}>
            <View style={styles.titleRow}>
              <Text style={styles.title}>{contest.title || "NIFTY 50 MEGA ARENA"}</Text>
              <View style={styles.statusPill}>
                <Text style={styles.statusText}>{contest.status || "OPEN"}</Text>
              </View>
            </View>

            <View style={styles.priceRow}>
              <Text style={styles.subtitleText}>
                {contest.subtitle || "Daily Grand Tournament"}
              </Text>
              <View style={styles.firstPrizePill}>
                <Text style={styles.firstPrizeText}>
                  1st: {contest.firstPrizeInr || "₹1,00,000"}
                </Text>
              </View>
            </View>
          </View>

          {/* Top Right: Prize Pool & USDT Badge */}
          <View style={styles.rightHeaderBlock}>
            <Text style={styles.prizePoolAmount}>{prizeInr}</Text>
            <Text style={styles.prizePoolLabel}>PRIZE POOL</Text>

            <View style={styles.usdtPill}>
              <View style={styles.usdtIconCircle}>
                <Text style={styles.usdtIconText}>₮</Text>
              </View>
              <Text style={styles.usdtAmountText}>
                {prizeUsdt} {prizeUsdt.includes("USDT") ? "" : "USDT"}
              </Text>
            </View>
          </View>
        </View>

        {/* 3 Metrics: ENTRY | PLAYERS | CLOSES */}
        <View style={styles.metricsRow}>
          <View style={styles.metricCol}>
            <Text style={styles.metricLabel}>ENTRY</Text>
            <Text style={styles.metricValue}>{entryInr}</Text>
            <Text style={styles.metricSub}>{entryUsdt}</Text>
          </View>

          <View style={styles.metricCol}>
            <Text style={styles.metricLabel}>PLAYERS</Text>
            <Text style={styles.metricValue}>{players}</Text>
          </View>

          <View style={[styles.metricCol, { alignItems: "flex-end" }]}>
            <Text style={styles.metricLabel}>CLOSES</Text>
            <Text style={styles.closesValue}>{closesIn}</Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBarTrack}>
          <View style={[styles.progressBarFill, { width: `${fill}%` }]} />
        </View>

        {/* Footer: Fill percentage & View Contest Action */}
        <View style={styles.footerRow}>
          <Text style={styles.filledText}>{fill}% filled</Text>

          <View style={styles.viewContestBtn}>
            <Text style={styles.viewContestText}>View Contest</Text>
            <Ionicons name="chevron-forward" size={15} color="#00C987" style={{ marginTop: 1 }} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    marginBottom: 16,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 16,
    borderTopWidth: 3.5,
    borderTopColor: "#00C987",
    borderWidth: 1,
    borderColor: "#EAEFF5",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  leftHeaderBlock: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "900",
    color: "#071329",
    letterSpacing: -0.4,
  },
  statusPill: {
    backgroundColor: "#E6FBF3",
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10.5,
    fontWeight: "900",
    color: "#00C987",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    gap: 8,
    flexWrap: "wrap",
  },
  subtitleText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#64748B",
  },
  firstPrizePill: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 8,
  },
  firstPrizeText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#B45309",
  },
  rightHeaderBlock: {
    alignItems: "flex-end",
  },
  prizePoolAmount: {
    fontSize: 24,
    fontWeight: "900",
    color: "#F59E0B",
    letterSpacing: -0.5,
  },
  prizePoolLabel: {
    fontSize: 9.5,
    fontWeight: "800",
    color: "#94A3B8",
    letterSpacing: 0.8,
    marginTop: 1,
  },
  usdtPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E6FBF3",
    borderWidth: 1,
    borderColor: "#A7F3D0",
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    marginTop: 6,
  },
  usdtIconCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#00C987",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 5,
  },
  usdtIconText: {
    fontSize: 8.5,
    fontWeight: "900",
    color: "#FFFFFF",
    lineHeight: 11,
  },
  usdtAmountText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#059669",
  },
  metricsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginTop: 22,
    marginBottom: 16,
  },
  metricCol: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "#94A3B8",
    letterSpacing: 0.6,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: "900",
    color: "#071329",
    marginTop: 4,
  },
  metricSub: {
    fontSize: 10.5,
    fontWeight: "600",
    color: "#94A3B8",
    marginTop: 2,
  },
  closesValue: {
    fontSize: 16,
    fontWeight: "900",
    color: "#F59E0B",
    letterSpacing: 0.8,
    marginTop: 4,
  },
  progressBarTrack: {
    height: 4.5,
    backgroundColor: "#F1F5F9",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 12,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#00C987",
    borderRadius: 4,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  filledText: {
    fontSize: 11.5,
    fontWeight: "600",
    color: "#94A3B8",
  },
  viewContestBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  viewContestText: {
    fontSize: 15,
    fontWeight: "900",
    color: "#00C987",
  },
});
