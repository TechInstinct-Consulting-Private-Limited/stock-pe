import React, { useState, useMemo } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { colors, radii, shadows, spacing, typography } from "../../../theme";
import TabPills from "../../../components/ui/TabPills";
import AppCard from "../../../components/ui/AppCard";
import EventFeedCard from "../components/EventFeedCard";
import { CATEGORIES, EVENTS_DATA, fetchUserTrades } from "../services/eventsService";

export default function EventsFeedScreen() {
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filterTabs = ["ALL", "• LIVE", "OPEN", "SOON"];
  const userTrades = fetchUserTrades();
  const activeCount = userTrades.filter((t) => t.status === "ACTIVE").length;

  const filteredEvents = useMemo(() => {
    return EVENTS_DATA.filter((ev) => {
      const matchesCategory =
        selectedCategory === "all" || ev.category === selectedCategory;

      let matchesFilter = true;
      if (activeFilter === "• LIVE") matchesFilter = ev.status.includes("LIVE");
      if (activeFilter === "OPEN") matchesFilter = ev.status === "OPEN";
      if (activeFilter === "SOON") matchesFilter = ev.status === "SOON";

      return matchesCategory && matchesFilter;
    });
  }, [selectedCategory, activeFilter]);

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
                ₹49.5L
              </Text>
              <Text style={styles.heroStatSub}>today</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.heroStatCol}>
              <Text style={styles.heroStatLabel}>LIVE TRADERS</Text>
              <Text style={[styles.heroStatNum, { color: colors.cyan }]}>
                23,490
              </Text>
              <Text style={styles.heroStatSub}>competing</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.heroStatCol}>
              <Text style={styles.heroStatLabel}>PAID OUT</Text>
              <Text style={[styles.heroStatNum, { color: colors.gold }]}>
                ₹2.1Cr
              </Text>
              <Text style={styles.heroStatSub}>all time</Text>
            </View>
          </View>

          <View style={styles.usdtStrip}>
            <View style={styles.usdtDot}>
              <Text style={styles.usdtSymbol}>₮</Text>
            </View>
            <Text style={styles.usdtText}>
              1 USDT = ₹73.42{"   "}•{"   "}Live{"   "}•{"   "}All payouts in crypto
            </Text>
          </View>
        </AppCard>

        {/* Category Horizontal Scroll */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
          style={styles.categoryContainer}
        >
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryChip,
                  isSelected && styles.categoryChipActive,
                ]}
                onPress={() => setSelectedCategory(cat.id)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={cat.icon}
                  size={13}
                  color={isSelected ? colors.textWhite : colors.textMuted}
                />
                <Text
                  style={[
                    styles.categoryText,
                    isSelected && styles.categoryTextActive,
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Filter Pills */}
        <TabPills
          tabs={filterTabs}
          activeTab={activeFilter}
          onTabChange={setActiveFilter}
          style={{ marginBottom: spacing.md }}
        />

        {/* Event Cards List */}
        <View style={styles.list}>
          {filteredEvents.map((item) => (
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
  categoryContainer: {
    marginBottom: spacing.md,
  },
  categoryScroll: {
    gap: spacing.sm,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm - 1,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderMedium,
  },
  categoryChipActive: {
    backgroundColor: colors.textPrimary,
    borderColor: colors.textPrimary,
  },
  categoryText: {
    fontSize: typography.sm + 0.5,
    fontWeight: typography.bold,
    color: colors.textMuted,
  },
  categoryTextActive: {
    color: colors.textWhite,
    fontWeight: typography.black,
  },
  list: {
    gap: spacing.xs,
  },
});
