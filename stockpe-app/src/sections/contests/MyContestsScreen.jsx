import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, radii, spacing, typography } from "../../theme";
import { useMyContests } from "./contestsHook";

export default function MyContestsScreen() {
  const { activeFilter, setActiveFilter, filteredContests, summary } = useMyContests();

  const filterTabs = [
    { id: "ALL", label: "ALL" },
    { id: "ACTIVE", label: "ACTIVE" },
    { id: "WON", label: "WON 🏆" },
    { id: "LOST", label: "LOST" },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
          {/* Top Dark Summary Card */}
          <View style={styles.summaryCard}>
            {/* Header */}
            <View style={styles.summaryHeader}>
              <Text style={styles.sparkleIcon}>✨</Text>
              <Text style={styles.summaryTitle}>MY CONTEST SUMMARY</Text>
            </View>

            {/* Counts Row */}
            <View style={styles.countsRow}>
              <View style={styles.countCol}>
                <Text style={styles.countNum}>{summary.totalJoined}</Text>
                <Text style={styles.countLabel}>Joined</Text>
              </View>
              <View style={styles.countCol}>
                <Text style={styles.countNum}>{summary.active}</Text>
                <Text style={styles.countLabel}>Active</Text>
              </View>
              <View style={styles.countCol}>
                <Text style={[styles.countNum, { color: colors.primary }]}>
                  {summary.won}
                </Text>
                <Text style={styles.countLabel}>Won</Text>
              </View>
              <View style={styles.countCol}>
                <Text style={[styles.countNum, { color: "#FF5B60" }]}>
                  {summary.lost}
                </Text>
                <Text style={styles.countLabel}>Lost</Text>
              </View>
            </View>

            {/* Financials Row */}
            <View style={styles.financialsRow}>
              <View style={styles.finCol}>
                <Text style={styles.finLabel}>Total Spent</Text>
                <Text style={styles.finVal}>{summary.totalSpent}</Text>
              </View>

              <View style={[styles.finCol, { alignItems: "center" }]}>
                <Text style={styles.finLabel}>Total Won</Text>
                <Text style={[styles.finVal, { color: colors.primary }]}>
                  {summary.totalWon}
                </Text>
              </View>

              <View style={[styles.finCol, { alignItems: "flex-end" }]}>
                <Text style={styles.finLabel}>Net P&L</Text>
                <Text style={[styles.finVal, { color: colors.primary }]}>
                  {summary.netPnl}
                </Text>
              </View>
            </View>
          </View>

          {/* Filter Segment Pills */}
          <View style={styles.filterPillContainer}>
            {filterTabs.map((tab) => {
              const isSelected = activeFilter === tab.id;
              return (
                <TouchableOpacity
                  key={tab.id}
                  style={[styles.filterPill, isSelected && styles.filterPillActive]}
                  onPress={() => setActiveFilter(tab.id)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.filterPillText,
                      isSelected && styles.filterPillTextActive,
                    ]}
                  >
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Joined Contests List */}
          <View style={styles.contestList}>
            {filteredContests.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="trophy-outline" size={44} color={colors.textMuted} />
                <Text style={styles.emptyTitle}>No Contests Found</Text>
                <Text style={styles.emptySubtitle}>
                  Join an Indian Index price prediction contest to track your accuracy and live rank!
                </Text>
                <TouchableOpacity
                  style={styles.exploreBtn}
                  onPress={() => router.push("/(tabs)/explore")}
                  activeOpacity={0.8}
                >
                  <Text style={styles.exploreBtnText}>Explore Index Contests</Text>
                </TouchableOpacity>
              </View>
            ) : (
              filteredContests.map((item) => {
                const isWon = item.status.includes("WON");
                const isLive = item.status === "LIVE";
                const isLost = item.status === "LOST";

                return (
                  <View key={item.joinId} style={styles.contestCard}>
                    {/* Top Green Accent Bar (for Won contests) */}
                    {isWon && <View style={styles.cardTopAccent} />}

                    <View style={styles.cardInner}>
                      {/* Header Row */}
                      <View style={styles.cardHeaderRow}>
                        <View style={styles.cardTitleCol}>
                          <View style={styles.cardTitleGroup}>
                            <Text style={styles.indexTitle}>
                              {item.indexSymbol || item.contestTitle}
                            </Text>
                            <View
                              style={[
                                styles.statusBadge,
                                isWon && styles.statusBadgeWon,
                                isLive && styles.statusBadgeLive,
                                isLost && styles.statusBadgeLost,
                              ]}
                            >
                              <Text
                                style={[
                                  styles.statusBadgeText,
                                  isWon && styles.statusBadgeTextWon,
                                  isLive && styles.statusBadgeTextLive,
                                  isLost && styles.statusBadgeTextLost,
                                ]}
                              >
                                {isWon ? "WON 🏆" : isLive ? "LIVE" : "LOST"}
                              </Text>
                            </View>
                          </View>
                          <Text style={styles.cardDate}>{item.timestamp}</Text>
                        </View>

                        {/* Top Right: Prize Info */}
                        {isWon && item.prizeInr && (
                          <View style={styles.prizeRightCol}>
                            <Text style={styles.prizeInrText}>{item.prizeInr}</Text>
                            {item.prizeUsdt && (
                              <View style={styles.usdtBadgePill}>
                                <View style={styles.usdtSymbolCircle}>
                                  <Text style={styles.usdtSymbolText}>₮</Text>
                                </View>
                                <Text style={styles.usdtBadgeText}>
                                  {item.prizeUsdt}
                                </Text>
                              </View>
                            )}
                          </View>
                        )}
                      </View>

                      {/* 3-Column Metrics Grid */}
                      <View style={styles.metricsRow}>
                        {/* Column 1: PREDICTION */}
                        <View style={styles.metricCol}>
                          <Text style={styles.metricHeader}>PREDICTION</Text>
                          <Text style={styles.metricValueBold}>
                            {item.prediction || "24,850.00"}
                          </Text>
                        </View>

                        {/* Column 2: ENTRY FEE */}
                        <View style={styles.metricCol}>
                          <Text style={styles.metricHeader}>ENTRY FEE</Text>
                          <Text style={styles.metricValueBold}>
                            {item.entryFeeInr || item.entryFee || "₹99"}
                          </Text>
                          <Text style={styles.metricSubValue}>
                            {item.entryFeeUsdt || "1.35 USDT"}
                          </Text>
                        </View>

                        {/* Column 3: ACCURACY */}
                        <View style={[styles.metricCol, { alignItems: "flex-end" }]}>
                          <Text style={styles.metricHeader}>ACCURACY</Text>
                          <Text
                            style={[
                              styles.metricValueBold,
                              { color: isWon ? colors.primary : colors.textPrimary },
                            ]}
                          >
                            {item.accuracy ? `${item.accuracy.toFixed(2)}%` : "98.50%"}
                          </Text>
                          {isWon && item.rank && (
                            <Text style={styles.rankBadgeText}>
                              Rank #{item.rank}
                            </Text>
                          )}
                        </View>
                      </View>

                      {/* Progress Bar Section */}
                      <View style={styles.progressContainer}>
                        <View style={styles.progressLabelRow}>
                          <Text style={styles.progressLabelLeft}>Accuracy</Text>
                          <Text
                            style={[
                              styles.progressLabelRight,
                              { color: isWon ? colors.primary : colors.textMuted },
                            ]}
                          >
                            {item.accuracy ? `${item.accuracy.toFixed(2)}%` : "98.50%"}
                          </Text>
                        </View>
                        <View style={styles.progressBarTrack}>
                          <View
                            style={[
                              styles.progressBarFill,
                              {
                                width: `${Math.min(item.accuracy || 98.5, 100)}%`,
                                backgroundColor: isWon ? colors.primary : "#94A3B8",
                              },
                            ]}
                          />
                        </View>
                      </View>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        </ScrollView>
      </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl + 20,
  },
  summaryCard: {
    backgroundColor: "#0D1B2A",
    borderRadius: 20,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    marginBottom: spacing.base,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: spacing.base,
  },
  sparkleIcon: {
    fontSize: 14,
  },
  summaryTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: "#8E9EB5",
    letterSpacing: 1.5,
  },
  countsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: "#1B2A47",
  },
  countCol: {
    alignItems: "center",
    flex: 1,
  },
  countNum: {
    fontSize: 26,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },
  countLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#7E92A9",
    marginTop: 3,
  },
  financialsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: spacing.base,
  },
  finCol: {
    flex: 1,
  },
  finLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#7E92A9",
    marginBottom: 3,
  },
  finVal: {
    fontSize: 18,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  filterPillContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 30,
    padding: 4,
    marginBottom: spacing.base,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  filterPill: {
    flex: 1,
    paddingVertical: 9,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 24,
  },
  filterPillActive: {
    backgroundColor: colors.primary,
  },
  filterPillText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#64748B",
  },
  filterPillTextActive: {
    color: "#FFFFFF",
    fontWeight: "900",
  },
  contestList: {
    gap: spacing.base,
  },
  contestCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E8EEF5",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    overflow: "hidden",
  },
  cardTopAccent: {
    height: 3.5,
    backgroundColor: colors.primary,
    width: "100%",
  },
  cardInner: {
    padding: spacing.base,
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.md,
  },
  cardTitleCol: {
    flex: 1,
  },
  cardTitleGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  indexTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#0F172A",
    letterSpacing: -0.3,
  },
  statusBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusBadgeWon: {
    backgroundColor: "#E6FBF3",
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  statusBadgeLive: {
    backgroundColor: "#E0F2FE",
    borderWidth: 1,
    borderColor: "#BAE6FD",
  },
  statusBadgeLost: {
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  statusBadgeText: {
    fontSize: 9.5,
    fontWeight: "800",
  },
  statusBadgeTextWon: {
    color: "#00A86B",
  },
  statusBadgeTextLive: {
    color: "#0284C7",
  },
  statusBadgeTextLost: {
    color: "#64748B",
  },
  cardDate: {
    fontSize: 12,
    fontWeight: "600",
    color: "#94A3B8",
    marginTop: 4,
  },
  prizeRightCol: {
    alignItems: "flex-end",
  },
  prizeInrText: {
    fontSize: 22,
    fontWeight: "900",
    color: "#F59E0B",
    letterSpacing: -0.5,
  },
  usdtBadgePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E6FBF3",
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 12,
    marginTop: 3,
    borderWidth: 1,
    borderColor: "#A7F3D0",
    gap: 4,
  },
  usdtSymbolCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  usdtSymbolText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "900",
  },
  usdtBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#00A86B",
  },
  metricsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  metricCol: {
    flex: 1,
  },
  metricHeader: {
    fontSize: 9.5,
    fontWeight: "800",
    color: "#94A3B8",
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  metricValueBold: {
    fontSize: 16.5,
    fontWeight: "900",
    color: "#0F172A",
  },
  metricSubValue: {
    fontSize: 11,
    fontWeight: "600",
    color: "#94A3B8",
    marginTop: 2,
  },
  rankBadgeText: {
    fontSize: 10.5,
    fontWeight: "800",
    color: "#F59E0B",
    marginTop: 2,
  },
  progressContainer: {
    marginTop: 4,
  },
  progressLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  progressLabelLeft: {
    fontSize: 10.5,
    fontWeight: "700",
    color: "#94A3B8",
  },
  progressLabelRight: {
    fontSize: 10.5,
    fontWeight: "800",
  },
  progressBarTrack: {
    height: 4,
    backgroundColor: "#E2E8F0",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 2,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: spacing.xxl,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingHorizontal: spacing.lg,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: "#0F172A",
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#94A3B8",
    textAlign: "center",
    lineHeight: 18,
    marginBottom: spacing.lg,
  },
  exploreBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
  },
  exploreBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
  },
});

