import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radii, spacing, typography } from "../../theme";

export default function TeamBudgetBar({
  selectedCount,
  maxCount = 6,
  creditsRemaining,
  totalCredits = 100,
  longCount,
  shortCount,
  onOpenPreview,
}) {
  const percentComplete = (selectedCount / maxCount) * 100;
  const isComplete = selectedCount === maxCount;

  return (
    <View style={styles.container}>
      {/* Top Row: Metrics & Preview Button */}
      <View style={styles.topRow}>
        <View style={styles.counterGroup}>
          <Text style={styles.counterTitle}>SQUAD SELECTION</Text>
          <Text style={styles.counterValue}>
            {selectedCount} / {maxCount} Stocks
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.counterGroup}>
          <Text style={styles.counterTitle}>CREDITS LEFT</Text>
          <Text
            style={[
              styles.counterValue,
              creditsRemaining < 10 && { color: colors.warning },
            ]}
          >
            {creditsRemaining.toFixed(1)} / {totalCredits}
          </Text>
        </View>

        {/* Preview Button */}
        <TouchableOpacity
          style={[
            styles.previewBtn,
            selectedCount > 0 && styles.previewBtnActive,
          ]}
          onPress={onOpenPreview}
          disabled={selectedCount === 0}
          activeOpacity={0.8}
        >
          <Ionicons
            name="eye-outline"
            size={16}
            color={selectedCount > 0 ? colors.primary : colors.textLight}
          />
          <Text
            style={[
              styles.previewText,
              selectedCount > 0 && styles.previewTextActive,
            ]}
          >
            Preview
          </Text>
        </TouchableOpacity>
      </View>

      {/* Progress Track */}
      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${percentComplete}%`,
              backgroundColor: isComplete ? colors.primary : colors.cyan,
            },
          ]}
        />
      </View>

      {/* Bottom Sub-bar: Long/Short indicators */}
      <View style={styles.subIndicatorsRow}>
        <View style={styles.indicatorPill}>
          <Text style={styles.indicatorLong}>🚀 {longCount} Bullish Long</Text>
        </View>
        <View style={styles.indicatorPill}>
          <Text style={styles.indicatorShort}>🔻 {shortCount} Bearish Short</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surfaceDark,
    borderRadius: radii.xl,
    padding: spacing.base,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderDark,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm + 2,
  },
  counterGroup: {
    flex: 1,
  },
  counterTitle: {
    fontSize: typography.xs - 0.5,
    fontWeight: typography.black,
    color: colors.textMuted,
    letterSpacing: typography.wide,
    marginBottom: 2,
  },
  counterValue: {
    fontSize: typography.base + 1,
    fontWeight: typography.black,
    color: colors.textWhite,
  },
  divider: {
    width: 1,
    height: 28,
    backgroundColor: colors.borderDark,
    marginHorizontal: spacing.sm,
  },
  previewBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.surfaceDarkElevated,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderDark,
  },
  previewBtnActive: {
    borderColor: colors.primary,
    backgroundColor: "rgba(0, 201, 135, 0.12)",
  },
  previewText: {
    fontSize: typography.sm,
    fontWeight: typography.bold,
    color: colors.textLight,
  },
  previewTextActive: {
    color: colors.primary,
  },
  progressTrack: {
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: radii.xs,
    overflow: "hidden",
    marginBottom: spacing.sm + 2,
  },
  progressFill: {
    height: "100%",
    borderRadius: radii.xs,
  },
  subIndicatorsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  indicatorPill: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.xs,
  },
  indicatorLong: {
    fontSize: typography.xs + 0.5,
    fontWeight: typography.bold,
    color: "#34D399",
  },
  indicatorShort: {
    fontSize: typography.xs + 0.5,
    fontWeight: typography.bold,
    color: "#F87171",
  },
});
