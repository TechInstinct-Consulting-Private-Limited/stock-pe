import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { colors, radii, spacing, typography } from "../../../theme";
import TabPills from "../../../components/ui/TabPills";
import AppCard from "../../../components/ui/AppCard";
import EventFeedCard from "../components/EventFeedCard";
import { getMyDemoContests } from "../../../services/api";
import { DASHBOARD_TABS, fetchDashboard, groupFeedCards, toFeedCard } from "../services/dashboardService";
import { usePullToRefresh } from "../../../hooks/usePullToRefresh";

const FILTER_IDS = new Set(DASHBOARD_TABS.map((tab) => tab.id));

export default function EventsFeedScreen({ initialFilter = "ALL" }) {
  const requestedFilter = FILTER_IDS.has(String(initialFilter || "").toUpperCase())
    ? String(initialFilter).toUpperCase()
    : "ALL";
  const [activeFilter, setActiveFilter] = useState(requestedFilter);
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [clock, setClock] = useState(Date.now());
  const [activeCount, setActiveCount] = useState(0);
  const [showingUpcomingFallback, setShowingUpcomingFallback] = useState(false);

  const loadDashboard = useCallback(async ({ showLoading = true, filter = activeFilter } = {}) => {
    if (showLoading) setIsLoading(true);
    setError("");

    try {
      const response = await fetchDashboard(filter);
      const hasOpenContests = Array.isArray(response?.contests) && response.contests.length > 0;

      if (filter === "OPEN" && !hasOpenContests) {
        const upcomingResponse = await fetchDashboard("SOON");
        setDashboard(upcomingResponse);
        setShowingUpcomingFallback(true);
        setActiveFilter("SOON");
        return;
      }

      setDashboard(response);
      if (!(filter === "SOON" && showingUpcomingFallback)) {
        setShowingUpcomingFallback(false);
      }
      if (filter === "OPEN" && activeFilter !== "OPEN") setActiveFilter("OPEN");
    } catch (_error) {
      setError("Dashboard data is unavailable. Please try again.");
    } finally {
      if (showLoading) setIsLoading(false);
    }
  }, [activeFilter, showingUpcomingFallback]);

  const refreshDashboard = useCallback(async () => {
    await loadDashboard({
      showLoading: false,
      filter: showingUpcomingFallback ? "OPEN" : activeFilter,
    });
  }, [activeFilter, loadDashboard, showingUpcomingFallback]);

  const refreshActiveCount = useCallback(async () => {
    try {
      const response = await getMyDemoContests("ACTIVE");
      setActiveCount(Array.isArray(response?.entries) ? response.entries.length : 0);
    } catch (_error) {
      // Contest feed remains available even when the authenticated summary cannot load.
    }
  }, []);

  const refreshFeed = useCallback(async () => {
    await Promise.all([refreshDashboard(), refreshActiveCount()]);
  }, [refreshActiveCount, refreshDashboard]);

  const { refreshing, onRefresh } = usePullToRefresh(refreshFeed);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  useFocusEffect(
    useCallback(() => {
      refreshDashboard();
      refreshActiveCount();
      const timer = setInterval(() => {
        refreshDashboard();
        refreshActiveCount();
      }, 30_000);
      return () => clearInterval(timer);
    }, [refreshActiveCount, refreshDashboard])
  );

  useEffect(() => {
    const timer = setInterval(() => setClock(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const feedCards = useMemo(
    () => (dashboard?.contests || []).map((contest) => toFeedCard(contest, clock)),
    [clock, dashboard]
  );
  const feedGroups = useMemo(
    () => groupFeedCards(feedCards, clock),
    [clock, feedCards]
  );

  const summary = dashboard?.summary;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Nav Bar */}
        <View style={styles.quickBar}>
          <TouchableOpacity
            style={styles.positionsPill}
            onPress={() => router.push("/(tabs)/contests")}
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
          onTabChange={(filter) => {
            setShowingUpcomingFallback(false);
            setActiveFilter(filter);
          }}
          style={{ marginBottom: spacing.md }}
        />

        {!isLoading && !error && showingUpcomingFallback && (
          <View style={styles.upcomingNotice}>
            <Ionicons name="time-outline" size={19} color={colors.primary} />
            <View style={styles.upcomingNoticeCopy}>
              <Text style={styles.upcomingNoticeTitle}>No active predictions right now</Text>
              <Text style={styles.upcomingNoticeText}>Upcoming contests are shown below. You can join when entries open.</Text>
            </View>
          </View>
        )}

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

          {!isLoading && !error && activeFilter === "ALL" && feedGroups.map((group) => (
            <View key={group.id} style={styles.feedGroup}>
              <View style={styles.groupHeading}>
                <Text style={styles.groupTitle}>{group.title}</Text>
                <Text style={styles.groupSubtitle}>{group.subtitle}</Text>
              </View>
              {group.cards.map((item) => <EventFeedCard key={item.id} item={item} />)}
            </View>
          ))}

          {!isLoading && !error && activeFilter !== "ALL" && feedCards.map((item) => (
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
    paddingTop: 6,
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
  upcomingNotice: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: colors.primaryLight,
    borderColor: colors.primaryMuted,
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  upcomingNoticeCopy: { flex: 1 },
  upcomingNoticeTitle: { color: colors.successText, fontSize: typography.sm + 1, fontWeight: typography.black },
  upcomingNoticeText: { color: colors.textMuted, fontSize: typography.xs + 1, fontWeight: typography.bold, lineHeight: 18, marginTop: 3 },
  feedGroup: {
    marginBottom: spacing.sm,
  },
  groupHeading: {
    marginBottom: spacing.sm,
    marginLeft: 2,
  },
  groupTitle: {
    color: colors.textPrimary,
    fontSize: typography.sm,
    fontWeight: typography.black,
    letterSpacing: typography.wide,
  },
  groupSubtitle: {
    color: colors.textMuted,
    fontSize: typography.xs + 1,
    fontWeight: typography.bold,
    marginTop: 2,
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
