import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { colors, radii, shadows, spacing, typography } from "../../../theme";
import TabPills from "../../../components/ui/TabPills";
import AppCard from "../../../components/ui/AppCard";
import EventFeedCard from "../components/EventFeedCard";
import { fetchUserTrades } from "../services/eventsService";
import { DASHBOARD_TABS, fetchDashboard, toFeedCard } from "../services/dashboardService";

export default function EventsFeedScreen() {
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [clock, setClock] = useState(Date.now());

  const userTrades = fetchUserTrades();
  const activeCount = userTrades.filter((t) => t.status === "ACTIVE").length;

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetchDashboard(activeFilter);
      setDashboard(response);
    } catch (_error) {
      setError("Dashboard data is unavailable. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [activeFilter]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  useEffect(() => {
    const timer = setInterval(() => setClock(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const feedCards = useMemo(
    () => (dashboard?.contests || []).map((contest) => toFeedCard(contest, clock)),
    [clock, dashboard]
  );

  const summary = dashboard?.summary;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Nav Bar */}
        <View style={styles.quickBar}>
          <TouchableOpacity
            style={styles.positionsPill}
            onPress={() => router.push("/event/my-trades")}
            activeOpacity={0.7}
          >
            <Ionicons name="briefcase-outline" size={15} color={colors.primary} />
            <Text style={styles.positionsText}>My Predictions</Text>
            {activeCount > 0 && (
              <View style={styles.activeBadge}>
                <Text style={styles.activeBadgeText}>{activeCount}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.exploreBtn}
            onPress={() => router.push("/event/explore")}
            activeOpacity={0.7}
          >
            <Ionicons name="search-outline" size={15} color={colors.textMuted} />
            <Text style={styles.exploreText}>Explore All</Text>
          </TouchableOpacity>
        </View>

        {/* Dark Hero Metric Pool Card */}
        <AppCard variant="dark" style={styles.heroCard}>
          <View style={styles.heroStatsRow}>
            <View style={styles.heroStatCol}>
              <Text style={styles.heroStatLabel}>PRIZE POOL</Text>
              <Text style={[styles.heroStatNum, { color: colors.primary }]}>
                {summary ? `${(summary.prizePoolCredits / 100000).toFixed(1)}L` : "--"}
              </Text>
              <Text style={styles.heroStatSub}>demo credits today</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.heroStatCol}>
              <Text style={styles.heroStatLabel}>LIVE TRADERS</Text>
              <Text style={[styles.heroStatNum, { color: colors.cyan }]}>
                {summary ? summary.livePlayers.toLocaleString("en-IN") : "--"}
              </Text>
              <Text style={styles.heroStatSub}>demo players</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.heroStatCol}>
              <Text style={styles.heroStatLabel}>PAID OUT</Text>
              <Text style={[styles.heroStatNum, { color: colors.gold }]}>
                {summary ? `${(summary.paidOutCredits / 10000000).toFixed(1)}Cr` : "--"}
              </Text>
              <Text style={styles.heroStatSub}>demo only</Text>
            </View>
          </View>

          <View style={styles.usdtStrip}>
            <View style={styles.usdtDot}>
              <Text style={styles.usdtSymbol}>₮</Text>
            </View>
            <Text style={styles.usdtText}>
              Demo credits only • No entries, payouts, deposits, or withdrawals
            </Text>
          </View>
        </AppCard>

        {/* Filter Pills */}
        <TabPills
          tabs={DASHBOARD_TABS}
          activeTab={activeFilter}
          onTabChange={setActiveFilter}
          style={{ marginBottom: spacing.md }}
        />

        {/* Event Cards List */}
        <View style={styles.list}>
          {isLoading && (
            <View style={styles.stateCard}>
              <ActivityIndicator color={colors.primary} />
              <Text style={styles.stateText}>Loading demo dashboard…</Text>
            </View>
          )}

          {!isLoading && error && (
            <View style={styles.stateCard}>
              <Text style={styles.stateText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={loadDashboard}>
                <Text style={styles.retryButtonText}>TRY AGAIN</Text>
              </TouchableOpacity>
            </View>
          )}

          {!isLoading && !error && feedCards.length === 0 && (
            <View style={styles.stateCard}>
              <Text style={styles.stateText}>No demo contests are available in this tab.</Text>
            </View>
          )}

          {!isLoading && !error && feedCards.map((item) => (
            <EventFeedCard key={item.id} item={item} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl,
  },
  quickBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  positionsPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm - 1,
    borderRadius: radii.md,
    gap: spacing.xs + 2,
    borderWidth: 1,
    borderColor: colors.primaryMuted,
  },
  positionsText: {
    fontSize: typography.sm + 1,
    fontWeight: typography.black,
    color: colors.successText,
  },
  activeBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 1,
    borderRadius: radii.sm,
  },
  activeBadgeText: {
    color: colors.textWhite,
    fontSize: typography.xs,
    fontWeight: typography.black,
  },
  exploreBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm - 1,
    borderRadius: radii.md,
    gap: spacing.xs + 2,
    borderWidth: 1,
    borderColor: colors.borderMedium,
  },
  exploreText: {
    fontSize: typography.sm + 1,
    fontWeight: typography.bold,
    color: colors.textMuted,
  },
  heroCard: {
    marginBottom: spacing.md,
  },
  heroStatsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: spacing.md,
  },
  heroStatCol: {
    alignItems: "center",
    flex: 1,
  },
  heroStatLabel: {
    fontSize: typography.xs,
    fontWeight: typography.black,
    color: colors.textMuted,
    letterSpacing: typography.widest,
    marginBottom: spacing.xs,
  },
  heroStatNum: {
    fontSize: typography.xl,
    fontWeight: typography.black,
    letterSpacing: typography.tight,
  },
  heroStatSub: {
    fontSize: typography.xs + 1,
    fontWeight: typography.bold,
    color: colors.textMuted,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: colors.borderDark,
  },
  usdtStrip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderTopWidth: 1,
    borderTopColor: colors.borderDark,
    paddingTop: spacing.md,
    marginTop: 2,
  },
  usdtDot: {
    width: 15,
    height: 15,
    borderRadius: radii.full,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.xs + 2,
  },
  usdtSymbol: {
    color: colors.textWhite,
    fontSize: typography.xs,
    fontWeight: typography.black,
  },
  usdtText: {
    color: "#34D399",
    fontSize: typography.sm,
    fontWeight: typography.bold,
    letterSpacing: typography.wide,
  },
  list: {
    gap: spacing.xs,
  },
  stateCard: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.borderMedium,
    borderRadius: radii.lg,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.lg,
  },
  stateText: {
    color: colors.textMuted,
    fontSize: typography.sm + 1,
    fontWeight: typography.bold,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  retryButtonText: {
    color: colors.textWhite,
    fontSize: typography.xs + 1,
    fontWeight: typography.black,
    letterSpacing: typography.wide,
  },
});
