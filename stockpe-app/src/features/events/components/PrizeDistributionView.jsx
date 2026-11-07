import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { shadows } from "../../../theme";

export default function PrizeDistributionView({ event }) {
  const [chartMode, setChartMode] = useState("bars"); // "bars" | "donut"
  const unit = event?.currency === "DEMO_USDT" ? "Demo USDT" : "Credits";
  const prizePool = Math.max(0, Number(event?.prizePoolCredits || 0));
  const formatAmount = (value) => Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: unit === "Demo USDT" ? 2 : 0,
    maximumFractionDigits: 2,
  });

  const savedDistribution = Array.isArray(event?.prizeDistribution) ? event.prizeDistribution : [];
  const source = savedDistribution.length ? savedDistribution : [
    { rank: "1st Place", rankRange: "Rank 1", percent: 40, color: "#F59E0B" },
    { rank: "2nd Place", rankRange: "Rank 2", percent: 20, color: "#94A3B8" },
    { rank: "3rd Place", rankRange: "Rank 3", percent: 15, color: "#D97706" },
    { rank: "Rank 4–5", rankRange: "Rank 4–5", percent: 10, color: "#00C987" },
    { rank: "Rank 6–10", rankRange: "Rank 6–10", percent: 8, color: "#6366F1" },
    { rank: "Rank 11–50", rankRange: "Rank 11–50", percent: 5, color: "#A855F7" },
    { rank: "Rank 51+", rankRange: "Rank 51–100", percent: 2, color: "#64748B" },
  ];
  const distribution = source.map((item, index) => ({
    ...item,
    rank: item.rank || item.label,
    rankRange: item.rankRange || `Rank ${item.startRank}${item.endRank && item.endRank !== item.startRank ? `–${item.endRank}` : ""}`,
    color: item.color || ["#F59E0B", "#94A3B8", "#D97706", "#00C987", "#6366F1", "#A855F7", "#64748B"][index % 7],
    amount: prizePool * (item.percent / 100),
    sub: `${item.rankRange || `Rank ${item.startRank}${item.endRank && item.endRank !== item.startRank ? `–${item.endRank}` : ""}`} · ${item.percent}%`,
  }));

  return (
    <View style={styles.container}>
      {/* 3 Podium Cards */}
      <View style={styles.podiumRow}>
        {/* 2nd Place (Silver) */}
        <View style={[styles.podiumCard, styles.podiumCardSilver]}>
          <Text style={[styles.podiumRank, { color: "#64748B" }]}>2nd</Text>
          <View style={styles.trophyCircle}>
            <Ionicons name="trophy-outline" size={16} color="#64748B" />
          </View>
          <Text style={styles.podiumPrizeInr}>{formatAmount(distribution[1].amount)}</Text>
          <Text style={styles.podiumPrizeUsdt}>{unit}</Text>
        </View>

        {/* 1st Place (Gold Highlighted) */}
        <View style={[styles.podiumCard, styles.podiumCardGold]}>
          <Text style={[styles.podiumRank, { color: "#F59E0B" }]}>1st</Text>
          <View style={[styles.trophyCircle, { backgroundColor: "#FEF3C7" }]}>
            <Ionicons name="trophy" size={18} color="#F59E0B" />
          </View>
          <Text style={[styles.podiumPrizeInr, { fontSize: 16 }]}>{formatAmount(distribution[0].amount)}</Text>
          <Text style={styles.podiumPrizeUsdt}>{unit}</Text>
        </View>

        {/* 3rd Place (Bronze) */}
        <View style={[styles.podiumCard, styles.podiumCardBronze]}>
          <Text style={[styles.podiumRank, { color: "#D97706" }]}>3rd</Text>
          <View style={styles.trophyCircle}>
            <Ionicons name="trophy-outline" size={16} color="#D97706" />
          </View>
          <Text style={styles.podiumPrizeInr}>{formatAmount(distribution[2].amount)}</Text>
          <Text style={styles.podiumPrizeUsdt}>{unit}</Text>
        </View>
      </View>

      {/* Prize Distribution Visualizer Card */}
      <View style={styles.distCard}>
        <View style={styles.distHeader}>
          <Text style={styles.distTitle}>Prize Distribution</Text>

          {/* Bars / Donut Toggle Pill */}
          <View style={styles.togglePill}>
            <TouchableOpacity
              style={[styles.toggleBtn, chartMode === "bars" && styles.toggleBtnActive]}
              onPress={() => setChartMode("bars")}
              activeOpacity={0.7}
            >
              <Text style={[styles.toggleBtnText, chartMode === "bars" && styles.toggleBtnTextActive]}>
                Bars
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleBtn, chartMode === "donut" && styles.toggleBtnActive]}
              onPress={() => setChartMode("donut")}
              activeOpacity={0.7}
            >
              <Text style={[styles.toggleBtnText, chartMode === "donut" && styles.toggleBtnTextActive]}>
                Donut
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bars View */}
        {chartMode === "bars" ? (
          <View style={styles.barsContainer}>
            {distribution.map((item, idx) => (
              <View key={idx} style={styles.barRow}>
                <Text style={styles.barLabel}>{item.rank}</Text>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        width: `${item.percent * 2.2}%`,
                        backgroundColor: item.color,
                      },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
        ) : (
          /* Donut Proportions View */
          <View style={styles.donutViewContainer}>
            <View style={styles.donutCircleGraphic}>
              <View style={styles.donutInnerHole}>
                <Text style={styles.donutTotalLabel}>TOTAL</Text>
                <Text style={styles.donutTotalVal}>{formatAmount(prizePool)}</Text>
              </View>
            </View>
            <View style={styles.donutLegend}>
              {distribution.slice(0, 4).map((d, i) => (
                <View key={i} style={styles.legendRow}>
                  <View style={[styles.legendDot, { backgroundColor: d.color }]} />
                  <Text style={styles.legendLabel}>{d.rank}: {d.percent}%</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>

      {/* Full Prize Table Card */}
      <View style={styles.tableCard}>
        <View style={styles.tableHeader}>
          <Text style={styles.tableTitle}>FULL PRIZE TABLE</Text>
          <Text style={styles.tableTotalPrize}>{formatAmount(prizePool)} {unit}</Text>
        </View>

        <View style={styles.tableBody}>
          {distribution.map((row, idx) => (
            <View
              key={idx}
              style={[
                styles.tableRow,
                idx !== distribution.length - 1 && styles.tableRowBorder,
              ]}
            >
              <View style={styles.tableRowLeft}>
                <View style={[styles.indicatorPill, { backgroundColor: row.color }]} />
                <View>
                  <Text style={styles.rowRankTitle}>{row.rank}</Text>
                  <Text style={styles.rowRankSub}>{row.sub}</Text>
                </View>
              </View>

              <View style={styles.tableRowRight}>
                <Text style={styles.rowAmountInr}>{formatAmount(row.amount)}</Text>
                <Text style={styles.rowAmountUsdt}>{unit}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  podiumRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  podiumCard: {
    flex: 1,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    paddingVertical: 14,
    paddingHorizontal: 6,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    ...shadows.sm,
  },
  podiumCardGold: {
    backgroundColor: "#FFFBEB",
    borderColor: "#FDE68A",
    borderWidth: 1.5,
  },
  podiumCardSilver: {
    backgroundColor: "#F8FAFC",
  },
  podiumCardBronze: {
    backgroundColor: "#FFF7ED",
  },
  podiumRank: {
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 4,
  },
  trophyCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  podiumPrizeInr: {
    fontSize: 14.5,
    fontWeight: "900",
    color: "#071329",
  },
  podiumPrizeUsdt: {
    fontSize: 8.5,
    fontWeight: "700",
    color: "#94A3B8",
    marginTop: 2,
    textAlign: "center",
  },
  distCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#EEF2F6",
    marginBottom: 16,
    ...shadows.sm,
  },
  distHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  distTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#071329",
    letterSpacing: -0.3,
  },
  togglePill: {
    flexDirection: "row",
    backgroundColor: "#E6FBF3",
    borderRadius: 14,
    padding: 2,
  },
  toggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  toggleBtnActive: {
    backgroundColor: "#00C987",
  },
  toggleBtnText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#64748B",
  },
  toggleBtnTextActive: {
    color: "#FFFFFF",
  },
  barsContainer: {
    gap: 10,
  },
  barRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  barLabel: {
    width: 80,
    fontSize: 11,
    fontWeight: "700",
    color: "#64748B",
  },
  barTrack: {
    flex: 1,
    height: 14,
    backgroundColor: "transparent",
    justifyContent: "center",
  },
  barFill: {
    height: 14,
    borderRadius: 7,
  },
  donutViewContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingVertical: 10,
  },
  donutCircleGraphic: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 12,
    borderColor: "#F59E0B",
    borderTopColor: "#00C987",
    borderRightColor: "#6366F1",
    alignItems: "center",
    justifyContent: "center",
  },
  donutInnerHole: {
    alignItems: "center",
  },
  donutTotalLabel: {
    fontSize: 8,
    fontWeight: "800",
    color: "#94A3B8",
  },
  donutTotalVal: {
    fontSize: 12,
    fontWeight: "900",
    color: "#071329",
  },
  donutLegend: {
    gap: 6,
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748B",
  },
  tableCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#EEF2F6",
    marginBottom: 20,
    ...shadows.sm,
  },
  tableHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  tableTitle: {
    fontSize: 10.5,
    fontWeight: "800",
    color: "#94A3B8",
    letterSpacing: 0.8,
  },
  tableTotalPrize: {
    fontSize: 12,
    fontWeight: "800",
    color: "#64748B",
  },
  tableBody: {},
  tableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  tableRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  tableRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  indicatorPill: {
    width: 6,
    height: 24,
    borderRadius: 3,
  },
  rowRankTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#071329",
  },
  rowRankSub: {
    fontSize: 10,
    fontWeight: "600",
    color: "#94A3B8",
    marginTop: 1,
  },
  tableRowRight: {
    alignItems: "flex-end",
  },
  rowAmountInr: {
    fontSize: 15,
    fontWeight: "900",
    color: "#071329",
  },
  rowAmountUsdt: {
    fontSize: 9.5,
    fontWeight: "700",
    color: "#94A3B8",
    marginTop: 1,
  },
});
