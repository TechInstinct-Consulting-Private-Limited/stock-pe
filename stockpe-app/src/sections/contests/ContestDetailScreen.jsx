import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, radii, shadows, spacing, typography } from "../../theme";
import AppHeader from "../../components/ui/AppHeader";
import AppCard from "../../components/ui/AppCard";
import TabPills from "../../components/ui/TabPills";
import PrimaryButton from "../../components/ui/PrimaryButton";
import StatusBadge from "../../components/ui/StatusBadge";
import UsdtBadge from "../../../app/components/UsdtBadge";
import { useContestDetail } from "./contestsHook";
import PrizeMatrixTable from "./PrizeMatrixTable";
import LiveLeaderboardTable from "./LiveLeaderboardTable";

export default function ContestDetailScreen({ contestId }) {
  const insets = useSafeAreaInsets();
  const { contest, activeTab, setActiveTab } = useContestDetail(contestId);

  const tabs = [
    { id: "prizes", label: "Prize Matrix" },
    { id: "rules", label: "Scoring Rules" },
    { id: "leaderboard", label: "Leaderboard" },
  ];

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <AppHeader
          title={contest.title}
          subtitle={`Closes in ${contest.closesIn}`}
          rightActions={
            <TouchableOpacity style={styles.shareBtn} activeOpacity={0.7}>
              <Ionicons name="share-social-outline" size={18} color={colors.textPrimary} />
            </TouchableOpacity>
          }
        />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Main Contest Hero Card */}
          <AppCard style={styles.heroCard}>
            <View style={styles.topRow}>
              <View>
                <Text style={styles.contestTitle}>{contest.title}</Text>
                <Text style={styles.contestSubtitle}>{contest.subtitle}</Text>
              </View>
              <StatusBadge status={contest.status} />
            </View>

            {/* Total Prize Pool Highlight */}
            <View style={styles.prizeHighlightBox}>
              <View>
                <Text style={styles.prizeLabel}>TOTAL PRIZE POOL</Text>
                <Text style={styles.prizeAmount}>{contest.prizePoolInr}</Text>
              </View>
              <UsdtBadge amount={contest.prizePoolUsdt} />
            </View>

            {/* First Prize Pill */}
            <View style={styles.firstPrizeRow}>
              <Text style={styles.trophy}>🏆</Text>
              <Text style={styles.firstPrizeText}>
                Rank 1 Prize: {contest.firstPrizeInr} ({contest.firstPrizeUsdt})
              </Text>
            </View>

            {/* Spots Left Progress Bar */}
            <View style={styles.progressSection}>
              <View style={styles.progressBg}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${contest.fillPercent}%` },
                  ]}
                />
              </View>
              <View style={styles.progressLabels}>
                <Text style={styles.spotsLeftText}>
                  {(contest.totalSpots - contest.filledSpots).toLocaleString()} spots left
                </Text>
                <Text style={styles.totalSpotsText}>
                  {contest.filledSpots.toLocaleString()} / {contest.totalSpots.toLocaleString()} filled
                </Text>
              </View>
            </View>
          </AppCard>

          {/* Tab Switcher */}
          <TabPills
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            style={{ marginBottom: spacing.md }}
          />

          {/* Tab 1 & 2: Prize Matrix & Rules */}
          {(activeTab === "prizes" || activeTab === "rules") && (
            <PrizeMatrixTable
              prizeMatrix={contest.prizeMatrix}
              rules={contest.rules}
            />
          )}

          {/* Tab 3: Leaderboard Preview */}
          {activeTab === "leaderboard" && (
            <LiveLeaderboardTable userRank={14} userPoints={284.5} />
          )}

          {/* Spacer for bottom CTA */}
          <View style={{ height: 110 }} />
        </ScrollView>

        {/* Sticky Bottom Join CTA */}
        <View
          style={[
            styles.bottomCTA,
            { paddingBottom: Math.max(insets.bottom, spacing.base) },
          ]}
        >
          <View style={styles.ctaFeeBox}>
            <Text style={styles.ctaFeeLabel}>ENTRY FEE</Text>
            <Text style={styles.ctaFeeAmount}>{contest.entryFeeInr}</Text>
            <Text style={styles.ctaFeeSub}>{contest.entryFeeUsdt}</Text>
          </View>

          <View style={styles.ctaBtnBox}>
            <PrimaryButton
              title="BUILD SQUAD & JOIN"
              iconName="flash"
              onPress={() => router.push(`/contest/${contest.id}/pick-stocks`)}
            />
          </View>
        </View>
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
  shareBtn: {
    width: 38,
    height: 38,
    borderRadius: radii.md,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.borderMedium,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.base,
  },
  heroCard: {
    marginBottom: spacing.md,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.md,
  },
  contestTitle: {
    fontSize: typography.lg,
    fontWeight: typography.black,
    color: colors.textPrimary,
  },
  contestSubtitle: {
    fontSize: typography.xs + 1,
    fontWeight: typography.bold,
    color: colors.textMuted,
    marginTop: 2,
  },
  prizeHighlightBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: radii.md,
    marginBottom: spacing.sm,
  },
  prizeLabel: {
    fontSize: typography.xs - 0.5,
    fontWeight: typography.black,
    color: colors.textLight,
    letterSpacing: typography.wide,
  },
  prizeAmount: {
    fontSize: typography.xl,
    fontWeight: typography.black,
    color: colors.warning,
  },
  firstPrizeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FEF3C7",
    padding: spacing.sm,
    borderRadius: radii.sm,
    marginBottom: spacing.md,
  },
  trophy: {
    fontSize: 13,
  },
  firstPrizeText: {
    fontSize: typography.sm,
    fontWeight: typography.bold,
    color: "#B45309",
  },
  progressSection: {
    marginTop: spacing.xs,
  },
  progressBg: {
    height: 6,
    backgroundColor: colors.borderLight,
    borderRadius: radii.sm,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: radii.sm,
  },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 5,
  },
  spotsLeftText: {
    fontSize: typography.xs + 0.5,
    fontWeight: typography.bold,
    color: colors.danger,
  },
  totalSpotsText: {
    fontSize: typography.xs + 0.5,
    fontWeight: typography.semibold,
    color: colors.textLight,
  },
  bottomCTA: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    paddingHorizontal: spacing.base,
    paddingTop: spacing.md,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.lg,
  },
  ctaFeeBox: {
    flex: 1,
  },
  ctaFeeLabel: {
    fontSize: typography.xs - 1,
    fontWeight: typography.black,
    color: colors.textLight,
    letterSpacing: typography.wide,
  },
  ctaFeeAmount: {
    fontSize: typography.lg,
    fontWeight: typography.black,
    color: colors.textPrimary,
  },
  ctaFeeSub: {
    fontSize: typography.xs,
    fontWeight: typography.semibold,
    color: colors.textMuted,
  },
  ctaBtnBox: {
    flex: 2,
  },
});
