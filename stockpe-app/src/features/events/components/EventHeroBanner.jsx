import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radii, spacing, typography } from "../../../theme";
import StatusBadge from "../../../components/ui/StatusBadge";
import AppCard from "../../../components/ui/AppCard";
import UsdtBadge from "../../../../app/components/UsdtBadge";

export default function EventHeroBanner({ event }) {
  if (!event) return null;

  return (
    <AppCard style={styles.card}>
      {/* Asset Header */}
      <View style={styles.assetHeaderRow}>
        <View style={styles.assetBadge}>
          <Text style={styles.assetName}>{event.title}</Text>
          <StatusBadge status={event.status} />
        </View>

        <View style={styles.spotPriceBox}>
          <Text style={styles.spotPriceLabel}>SPOT PRICE</Text>
          <Text style={styles.spotPriceValue}>{event.currentPrice}</Text>
          <Text
            style={[
              styles.spotPriceChange,
              { color: event.isPositive ? colors.success : colors.danger },
            ]}
          >
            {event.isPositive ? "↗ " : "↘ "}
            {event.change}
          </Text>
        </View>
      </View>

      {/* Main Question */}
      <Text style={styles.questionHeading}>{event.question}</Text>

      {/* Quick Metrics */}
      <View style={styles.quickMetricsRow}>
        <View style={styles.metricItem}>
          <Ionicons name="time-outline" size={14} color={colors.textMuted} />
          <Text style={styles.metricItemLabel}>Closes in:</Text>
          <Text style={styles.metricItemValue}>{event.closesIn}</Text>
        </View>

        <View style={styles.metricItem}>
          <Ionicons name="people-outline" size={14} color={colors.textMuted} />
          <Text style={styles.metricItemLabel}>Volume:</Text>
          <Text style={styles.metricItemValue}>{event.totalVolume}</Text>
        </View>
      </View>

      <View style={styles.usdtStrip}>
        <UsdtBadge amount={event.totalVolumeUsdt} />
        <Text style={styles.settlementDateText}>
          Settles: {event.settlementDate}
        </Text>
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  assetHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.md,
  },
  assetBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  assetName: {
    fontSize: typography.lg,
    fontWeight: typography.black,
    color: colors.textPrimary,
    letterSpacing: typography.tight,
  },
  spotPriceBox: {
    alignItems: "flex-end",
  },
  spotPriceLabel: {
    fontSize: typography.xs - 0.5,
    fontWeight: typography.black,
    color: colors.textLight,
    letterSpacing: typography.wide,
  },
  spotPriceValue: {
    fontSize: typography.md,
    fontWeight: typography.black,
    color: colors.textPrimary,
  },
  spotPriceChange: {
    fontSize: typography.sm,
    fontWeight: typography.bold,
  },
  questionHeading: {
    fontSize: typography.md + 1.5,
    fontWeight: typography.bold,
    color: colors.textSecondary,
    lineHeight: 23,
    marginBottom: spacing.md,
  },
  quickMetricsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.base,
    paddingVertical: spacing.sm + 2,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  metricItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  metricItemLabel: {
    fontSize: typography.sm,
    fontWeight: typography.semibold,
    color: colors.textMuted,
  },
  metricItemValue: {
    fontSize: typography.sm + 0.5,
    fontWeight: typography.black,
    color: colors.textPrimary,
  },
  usdtStrip: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.sm,
  },
  settlementDateText: {
    fontSize: typography.xs + 1.5,
    fontWeight: typography.semibold,
    color: colors.textLight,
  },
});
