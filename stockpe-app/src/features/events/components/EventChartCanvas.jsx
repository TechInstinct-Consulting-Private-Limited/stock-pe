import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors, radii, spacing, typography } from "../../../theme";
import AppCard from "../../../components/ui/AppCard";

export default function EventChartCanvas({
  event,
  activeTimeframe,
  onTimeframeChange,
}) {
  const timeframes = ["15M", "1H", "1D", "ALL"];

  return (
    <AppCard style={styles.card}>
      {/* Timeframe Chips */}
      <View style={styles.timeframeRow}>
        {timeframes.map((tf) => {
          const isActive = activeTimeframe === tf;
          return (
            <TouchableOpacity
              key={tf}
              style={[styles.tfPill, isActive && styles.tfPillActive]}
              onPress={() => onTimeframeChange(tf)}
              activeOpacity={0.7}
            >
              <Text style={[styles.tfText, isActive && styles.tfTextActive]}>
                {tf}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Chart Canvas */}
      <View style={styles.chartCanvas}>
        {/* Legend */}
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
            <Text style={styles.legendText}>YES ₹{event?.yesPrice}</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.danger }]} />
            <Text style={styles.legendText}>NO ₹{event?.noPrice}</Text>
          </View>
        </View>

        {/* Stepped Probability Bars */}
        <View style={styles.barsContainer}>
          {event?.chartHistory?.map((pt, idx) => {
            const yesHeight = (pt.yes / 10) * 120;
            const noHeight = (pt.no / 10) * 120;
            return (
              <View key={idx} style={styles.chartCol}>
                <View style={styles.barStack}>
                  <View
                    style={[
                      styles.chartBarYes,
                      { height: yesHeight },
                    ]}
                  />
                  <View
                    style={[
                      styles.chartBarNo,
                      { height: noHeight },
                    ]}
                  />
                </View>
                <Text style={styles.timeLabel}>{pt.time}</Text>
              </View>
            );
          })}
        </View>
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  timeframeRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  tfPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.sm + 2,
    backgroundColor: colors.divider,
  },
  tfPillActive: {
    backgroundColor: colors.textPrimary,
  },
  tfText: {
    fontSize: typography.sm - 0.5,
    fontWeight: typography.black,
    color: colors.textMuted,
  },
  tfTextActive: {
    color: colors.textWhite,
  },
  chartCanvas: {
    paddingTop: spacing.xs,
  },
  legendRow: {
    flexDirection: "row",
    gap: spacing.base,
    marginBottom: spacing.md,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs + 2,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: radii.xs,
  },
  legendText: {
    fontSize: typography.sm,
    fontWeight: typography.black,
    color: colors.textSecondary,
  },
  barsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 140,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  chartCol: {
    alignItems: "center",
    flex: 1,
  },
  barStack: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 2,
  },
  chartBarYes: {
    width: 10,
    backgroundColor: colors.primary,
    borderRadius: radii.xs,
  },
  chartBarNo: {
    width: 10,
    backgroundColor: colors.danger,
    borderRadius: radii.xs,
  },
  timeLabel: {
    fontSize: typography.xs,
    fontWeight: typography.bold,
    color: colors.textLight,
    marginTop: spacing.xs + 2,
  },
});
