import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radii, shadows, spacing, typography } from "../../../theme";

export default function PrizeDistributionView({ event }) {
  const [chartMode, setChartMode] = useState("bars"); // "bars" | "donut"

  const distribution = [
    { rank: "1st Place", percent: 40, color: "#F59E0B", amountInr: "₹400K", amountUsdt: "5448.11 USDT", sub: "Rank 1 • 40%" },
    { rank: "2nd Place", percent: 20, color: "#94A3B8", amountInr: "₹200K", amountUsdt: "2724.05 USDT", sub: "Rank 2 • 20%" },
    { rank: "3rd Place", percent: 15, color: "#D97706", amountInr: "₹150K", amountUsdt: "2043.04 USDT", sub: "Rank 3 • 15%" },
    { rank: "Rank 4–5", percent: 10, color: "#00C987", amountInr: "₹100K", amountUsdt: "1362.03 USDT", sub: "Rank 4–5 • 10%" },
    { rank: "Rank 6–10", percent: 7, color: "#6366F1", amountInr: "₹70K", amountUsdt: "953.42 USDT", sub: "Rank 6–10 • 7%" },
    { rank: "Rank 11–50", percent: 5, color: "#A855F7", amountInr: "₹50K", amountUsdt: "681.01 USDT", sub: "Rank 11–50 • 5%" },
    { rank: "Rank 51+", percent: 3, color: "#64748B", amountInr: "₹30K", amountUsdt: "408.61 USDT", sub: "Rank 51+ • 3%" },
  ];

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
          <Text style={styles.podiumPrizeInr}>₹200K</Text>
          <Text style={styles.podiumPrizeUsdt}>2724.05 USDT</Text>
        </View>

        {/* 1st Place (Gold Highlighted) */}
        <View style={[styles.podiumCard, styles.podiumCardGold]}>
          <Text style={[styles.podiumRank, { color: "#F59E0B" }]}>1st</Text>
          <View style={[styles.trophyCircle, { backgroundColor: "#FEF3C7" }]}>
            <Ionicons name="trophy" size={18} color="#F59E0B" />
          </View>
          <Text style={[styles.podiumPrizeInr, { fontSize: 16 }]}>₹400K</Text>
          <Text style={styles.podiumPrizeUsdt}>5448.11 USDT</Text>
        </View>

        {/* 3rd Place (Bronze) */}
        <View style={[styles.podiumCard, styles.podiumCardBronze]}>
          <Text style={[styles.podiumRank, { color: "#D97706" }]}>3rd</Text>
          <View style={styles.trophyCircle}>
            <Ionicons name="trophy-outline" size={16} color="#D97706" />
          </View>
          <Text style={styles.podiumPrizeInr}>₹150K</Text>
          <Text style={styles.podiumPrizeUsdt}>2043.04 USDT</Text>
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
                <Text style={styles.donutTotalVal}>₹10.0L</Text>
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
          <Text style={styles.tableTotalPrize}>₹10,00,000</Text>
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
                <Text style={styles.rowAmountInr}>{row.amountInr}</Text>
                <Text style={styles.rowAmountUsdt}>{row.amountUsdt}</Text>
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
