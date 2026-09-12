import React, { useState, useMemo } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { colors, radii, spacing, typography } from "../../theme";
import AppCard from "../../components/ui/AppCard";
import ContestFeedCard from "./ContestFeedCard";
import { CONTEST_CATEGORIES, fetchAllContests, fetchJoinedContests } from "./contestsService";

export default function ContestsFeedScreen() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const joinedList = fetchJoinedContests();
  const liveJoinedCount = joinedList.filter((c) => c.status === "LIVE").length;

  const contests = useMemo(() => {
    return fetchAllContests(selectedCategory);
  }, [selectedCategory]);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Quick Bar: My Contests Link */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.myContestsPill}
            onPress={() => router.push("/contest/my-contests")}
            activeOpacity={0.7}
          >
            <Ionicons name="trophy-outline" size={15} color={colors.primary} />
            <Text style={styles.myContestsText}>My Joined Contests</Text>
            {liveJoinedCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{liveJoinedCount} Live</Text>
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.marketStatusPill}>
            <View style={styles.liveDot} />
            <Text style={styles.marketStatusText}>MARKET OPEN</Text>
          </View>
        </View>

        {/* Dark Hero Pool Card */}
        <AppCard variant="dark" style={styles.heroCard}>
          <View style={styles.heroHeader}>
            <Text style={styles.sparkle}>✨</Text>
            <Text style={styles.heroTitle}>FANTASY STOCK ARENA</Text>
          </View>

          <View style={styles.heroStatsRow}>
            <View style={styles.heroStatCol}>
              <Text style={styles.heroStatLabel}>TOTAL LEAGUES</Text>
              <Text style={[styles.heroStatVal, { color: colors.primary }]}>
                ₹12.5L
              </Text>
              <Text style={styles.heroStatSub}>guaranteed today</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.heroStatCol}>
              <Text style={styles.heroStatLabel}>ACTIVE TRADERS</Text>
              <Text style={[styles.heroStatVal, { color: colors.cyan }]}>
                38,120
              </Text>
              <Text style={styles.heroStatSub}>forming squads</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.heroStatCol}>
              <Text style={styles.heroStatLabel}>TOP 1st PRIZE</Text>
              <Text style={[styles.heroStatVal, { color: colors.gold }]}>
                ₹1.0L
              </Text>
              <Text style={styles.heroStatSub}>single winner</Text>
            </View>
          </View>
        </AppCard>

        {/* Category Horizontal Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
          style={styles.categoryContainer}
        >
          {CONTEST_CATEGORIES.map((cat) => {
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

        {/* Contests Feed List */}
        <View style={styles.list}>
          {contests.map((item) => (
            <ContestFeedCard key={item.id} contest={item} />
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
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  myContestsPill: {
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
  myContestsText: {
    fontSize: typography.sm + 1,
    fontWeight: typography.black,
    color: colors.successText,
  },
  badge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 1,
    borderRadius: radii.sm,
  },
  badgeText: {
    color: colors.textWhite,
    fontSize: typography.xs,
    fontWeight: typography.black,
  },
  marketStatusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.sm - 2,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  marketStatusText: {
    fontSize: typography.xs,
    fontWeight: typography.black,
    color: colors.textSecondary,
    letterSpacing: typography.wide,
  },
  heroCard: {
    marginBottom: spacing.md,
  },
  heroHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: spacing.md,
  },
  sparkle: {
    fontSize: 12,
  },
  heroTitle: {
    fontSize: typography.xs,
    fontWeight: typography.black,
    color: colors.textMuted,
    letterSpacing: typography.widest,
  },
  heroStatsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  heroStatCol: {
    alignItems: "center",
    flex: 1,
  },
  heroStatLabel: {
    fontSize: typography.xs - 1,
    fontWeight: typography.black,
    color: colors.textMuted,
    letterSpacing: typography.widest,
    marginBottom: 2,
  },
  heroStatVal: {
    fontSize: typography.lg,
    fontWeight: typography.black,
    letterSpacing: typography.tight,
  },
  heroStatSub: {
    fontSize: typography.xs,
    fontWeight: typography.bold,
    color: colors.textMuted,
    marginTop: 2,
  },
  divider: {
    width: 1,
    height: 32,
    backgroundColor: colors.borderDark,
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
