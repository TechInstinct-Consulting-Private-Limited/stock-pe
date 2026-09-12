import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radii, spacing, typography } from "../../../theme";
import AppCard from "../../../components/ui/AppCard";
import { formatINR, formatUSDT } from "../../../utils/formatters";

export default function PortfolioMetricCard({ portfolio }) {
  const {
    totalInvested,
    totalCurrentValue,
    totalPnl,
    totalPnlPercent,
    isPnlPositive,
  } = portfolio;

  const cryptoEquiv = (totalCurrentValue / 73.42).toFixed(1);

  return (
    <AppCard variant="dark" style={styles.card}>
      {/* Top Value & P&L */}
      <View style={styles.topRow}>
        <View>
          <Text style={styles.label}>CURRENT PORTFOLIO VALUE</Text>
          <Text style={styles.mainValue}>{formatINR(totalCurrentValue)}</Text>
        </View>

        <View
          style={[
            styles.pnlPill,
            { backgroundColor: isPnlPositive ? "#064E3B" : "#7F1D1D" },
          ]}
        >
          <Ionicons
            name={isPnlPositive ? "trending-up" : "trending-down"}
            size={14}
            color={isPnlPositive ? colors.primary : colors.danger}
          />
          <Text
            style={[
              styles.pnlText,
              { color: isPnlPositive ? "#34D399" : "#F87171" },
            ]}
          >
            {isPnlPositive ? "+" : ""}
            {totalPnl} ({isPnlPositive ? "+" : ""}
            {totalPnlPercent}%)
          </Text>
        </View>
      </View>

      {/* Sub Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCol}>
          <Text style={styles.statLabel}>TOTAL INVESTED</Text>
          <Text style={styles.statVal}>{formatINR(totalInvested)}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.statCol}>
          <Text style={styles.statLabel}>WIN RATE</Text>
          <Text style={[styles.statVal, { color: colors.cyan }]}>76.4%</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.statCol}>
          <Text style={styles.statLabel}>CRYPTO EQUIV.</Text>
          <Text style={[styles.statVal, { color: colors.gold }]}>
            {formatUSDT(cryptoEquiv, 1)}
          </Text>
        </View>
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.base,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.base,
  },
  label: {
    fontSize: typography.xs,
    fontWeight: typography.black,
    color: colors.textMuted,
    letterSpacing: typography.widest,
    marginBottom: spacing.xs,
  },
  mainValue: {
    fontSize: typography.xxl,
    fontWeight: typography.black,
    color: colors.textWhite,
    letterSpacing: typography.tight,
  },
  pnlPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 1,
    borderRadius: radii.md,
  },
  pnlText: {
    fontSize: typography.sm + 1,
    fontWeight: typography.bold,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: colors.borderDark,
    paddingTop: spacing.md + 2,
  },
  statCol: {
    alignItems: "center",
    flex: 1,
  },
  statLabel: {
    fontSize: typography.xs - 0.5,
    fontWeight: typography.black,
    color: colors.textMuted,
    letterSpacing: typography.wide,
    marginBottom: 2,
  },
  statVal: {
    fontSize: typography.base,
    fontWeight: typography.bold,
    color: colors.textWhite,
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: colors.borderDark,
  },
});
