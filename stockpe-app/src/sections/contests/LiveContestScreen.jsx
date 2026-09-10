import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, radii, spacing, typography } from "../../theme";
import AppHeader from "../../components/ui/AppHeader";
import AppCard from "../../components/ui/AppCard";
import StatusBadge from "../../components/ui/StatusBadge";
import { fetchContestById, fetchJoinedContests } from "./contestsService";
import LiveLeaderboardTable from "./LiveLeaderboardTable";

export default function LiveContestScreen({ contestId }) {
  const contest = fetchContestById(contestId);
  const joinedList = fetchJoinedContests();
  const userEntry =
    joinedList.find((j) => j.contestId === contestId) || joinedList[0];

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <AppHeader
          title={contest.title}
          subtitle="Live Tournament Arena"
          rightActions={<StatusBadge status="• LIVE" />}
        />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Dark Live Rank Summary Hero Card */}
          <AppCard variant="dark" style={styles.heroCard}>
            <View style={styles.heroTopRow}>
              <View>
                <Text style={styles.heroLabel}>YOUR SQUAD</Text>
                <Text style={styles.teamName}>{userEntry.teamName}</Text>
              </View>

              <View style={styles.rankPill}>
                <Text style={styles.rankPillText}>
                  Rank #{userEntry.rank}
                </Text>
              </View>
            </View>

            <View style={styles.heroMetricsGrid}>
              <View style={styles.heroCol}>
                <Text style={styles.heroMetricLabel}>TOTAL POINTS</Text>
                <Text style={[styles.heroMetricVal, { color: colors.primary }]}>
                  {userEntry.points.toFixed(1)}
                </Text>
                <Text style={styles.heroMetricSub}>pts</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.heroCol}>
                <Text style={styles.heroMetricLabel}>GAP TO #1</Text>
                <Text style={[styles.heroMetricVal, { color: colors.warning }]}>
                  -32.0
                </Text>
                <Text style={styles.heroMetricSub}>pts</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.heroCol}>
                <Text style={styles.heroMetricLabel}>EST. WINNING</Text>
                <Text style={[styles.heroMetricVal, { color: colors.gold }]}>
                  ₹1,000
                </Text>
                <Text style={styles.heroMetricSub}>13.6 USDT</Text>
              </View>
            </View>
          </AppCard>

          {/* Squad Stock Points Breakdown */}
          <AppCard style={styles.squadCard}>
            <Text style={styles.squadTitle}>Squad Performance Breakdown</Text>
            <View style={styles.stocksGrid}>
              {userEntry.stocks?.map((stock) => {
                const isLong = stock.type === "LONG";
                return (
                  <View key={stock.symbol} style={styles.stockItem}>
                    <View style={styles.stockSymbolRow}>
                      <Text style={styles.stockSymbol}>{stock.symbol}</Text>
                      {stock.isCaptain && (
                        <View style={styles.cBadge}>
                          <Text style={styles.cText}>2x C</Text>
                        </View>
                      )}
                      {stock.isViceCaptain && (
                        <View style={styles.vcBadge}>
                          <Text style={styles.vcText}>1.5x VC</Text>
                        </View>
                      )}
                    </View>

                    <Text
                      style={[
                        styles.stockType,
                        { color: isLong ? colors.primary : colors.danger },
                      ]}
                    >
                      {isLong ? "LONG 🚀" : "SHORT 🔻"}
                    </Text>

                    <Text style={styles.stockPoints}>
                      +{stock.points.toFixed(1)} pts
                    </Text>
                  </View>
                );
              })}
            </View>
          </AppCard>

          {/* Live Tournament Leaderboard */}
          <Text style={styles.leaderboardTitle}>Live Leaderboard</Text>
          <LiveLeaderboardTable
            userRank={userEntry.rank}
            userPoints={userEntry.points}
          />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.base,
    paddingBottom: spacing.xxl,
  },
  heroCard: {
    marginBottom: spacing.base,
  },
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.base,
  },
  heroLabel: {
    fontSize: typography.xs - 0.5,
    fontWeight: typography.black,
    color: colors.textMuted,
    letterSpacing: typography.wide,
    marginBottom: 2,
  },
  teamName: {
    fontSize: typography.lg,
    fontWeight: typography.black,
    color: colors.textWhite,
  },
  rankPill: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radii.md,
  },
  rankPillText: {
    fontSize: typography.base,
    fontWeight: typography.black,
    color: colors.textWhite,
  },
  heroMetricsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: colors.borderDark,
    paddingTop: spacing.md + 2,
  },
  heroCol: {
    alignItems: "center",
    flex: 1,
  },
  heroMetricLabel: {
    fontSize: typography.xs - 1,
    fontWeight: typography.black,
    color: colors.textMuted,
    letterSpacing: typography.wide,
    marginBottom: 2,
  },
  heroMetricVal: {
    fontSize: typography.xl,
    fontWeight: typography.black,
  },
  heroMetricSub: {
    fontSize: typography.xs,
    fontWeight: typography.semibold,
    color: colors.textMuted,
  },
  divider: {
    width: 1,
    height: 32,
    backgroundColor: colors.borderDark,
  },
  squadCard: {
    marginBottom: spacing.base,
  },
  squadTitle: {
    fontSize: typography.base,
    fontWeight: typography.black,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  stocksGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    justifyContent: "space-between",
  },
  stockItem: {
    width: "48%",
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  stockSymbolRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 2,
  },
  stockSymbol: {
    fontSize: typography.sm + 1,
    fontWeight: typography.black,
    color: colors.textPrimary,
  },
  cBadge: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: radii.xs,
  },
  cText: {
    fontSize: typography.xs - 2,
    fontWeight: typography.black,
    color: "#B45309",
  },
  vcBadge: {
    backgroundColor: "#E0F2FE",
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: radii.xs,
  },
  vcText: {
    fontSize: typography.xs - 2,
    fontWeight: typography.black,
    color: "#0369A1",
  },
  stockType: {
    fontSize: typography.xs - 0.5,
    fontWeight: typography.bold,
    marginTop: 2,
  },
  stockPoints: {
    fontSize: typography.base,
    fontWeight: typography.black,
    color: colors.primary,
    marginTop: 4,
  },
  leaderboardTitle: {
    fontSize: typography.md + 1,
    fontWeight: typography.black,
    color: colors.textPrimary,
    marginBottom: spacing.sm + 2,
  },
});
