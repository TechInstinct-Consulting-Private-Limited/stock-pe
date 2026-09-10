import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { colors, radii, spacing, typography } from "../../../theme";
import AppCard from "../../../components/ui/AppCard";
import StatusBadge from "../../../components/ui/StatusBadge";
import { formatINR } from "../../../utils/formatters";

export default function PositionCard({
  trade,
  onExit,
}) {
  const isSettled = trade.status !== "ACTIVE";
  const isTradeProfitable = trade.pnl >= 0;
  const isWon = trade.status === "SETTLED_WON";

  return (
    <AppCard style={styles.card}>
      {/* Top Row: Title + Option + P&L */}
      <View style={styles.topRow}>
        <View style={styles.titleGroup}>
          <Text style={styles.title}>{trade.title}</Text>
          <StatusBadge status={trade.option} />
        </View>

        {!isSettled ? (
          <View
            style={[
              styles.pnlBadge,
              {
                backgroundColor: isTradeProfitable
                  ? colors.primaryLight
                  : colors.dangerBg,
              },
            ]}
          >
            <Text
              style={[
                styles.pnlText,
                { color: isTradeProfitable ? colors.primary : colors.danger },
              ]}
            >
              {isTradeProfitable ? "+" : ""}
              {formatINR(trade.pnl)} ({isTradeProfitable ? "+" : ""}
              {trade.pnlPercent}%)
            </Text>
          </View>
        ) : (
          <Text
            style={[
              styles.settledOutcomeText,
              { color: isWon ? colors.primary : colors.danger },
            ]}
          >
            {isWon ? `+${formatINR(trade.pnl)}` : `-${formatINR(trade.investedAmount)}`}
          </Text>
        )}
      </View>

      {/* Question */}
      <Text style={styles.question} numberOfLines={2}>
        {trade.question}
      </Text>

      {/* Financial Matrix (Active only) */}
      {!isSettled ? (
        <View style={styles.matrixContainer}>
          <View style={styles.matrixCol}>
            <Text style={styles.matrixLabel}>QUANTITY</Text>
            <Text style={styles.matrixVal}>{trade.quantity} units</Text>
          </View>

          <View style={styles.matrixCol}>
            <Text style={styles.matrixLabel}>BUY PRICE</Text>
            <Text style={styles.matrixVal}>₹{trade.buyPrice}</Text>
          </View>

          <View style={styles.matrixCol}>
            <Text style={styles.matrixLabel}>CURRENT</Text>
            <Text style={[styles.matrixVal, { color: colors.primary }]}>
              ₹{trade.currentPrice}
            </Text>
          </View>

          <View style={[styles.matrixCol, { alignItems: "flex-end" }]}>
            <Text style={styles.matrixLabel}>INVESTED</Text>
            <Text style={styles.matrixVal}>{formatINR(trade.investedAmount)}</Text>
          </View>
        </View>
      ) : null}

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.timestamp}>
          {trade.tradeId} • {trade.timestamp}
        </Text>

        {!isSettled ? (
          <View style={styles.actionGroup}>
            <TouchableOpacity
              style={styles.exitButton}
              onPress={() => onExit(trade)}
              activeOpacity={0.7}
            >
              <Text style={styles.exitText}>Exit Position</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.detailsButton}
              onPress={() => router.push(`/event/${trade.eventId}`)}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-forward" size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>
        ) : (
          <Text style={styles.payoutText}>
            Payout: {formatINR(trade.currentValue)}
          </Text>
        )}
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  titleGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  title: {
    fontSize: typography.base + 2,
    fontWeight: typography.black,
    color: colors.textPrimary,
  },
  pnlBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.sm,
  },
  pnlText: {
    fontSize: typography.sm + 0.5,
    fontWeight: typography.bold,
  },
  settledOutcomeText: {
    fontSize: typography.sm + 1,
    fontWeight: typography.black,
  },
  question: {
    fontSize: typography.base - 0.5,
    fontWeight: typography.semibold,
    color: colors.textSecondary,
    lineHeight: 19,
    marginBottom: spacing.md,
  },
  matrixContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: radii.md,
    marginBottom: spacing.md,
  },
  matrixCol: {
    flex: 1,
  },
  matrixLabel: {
    fontSize: typography.xs - 0.5,
    fontWeight: typography.black,
    color: colors.textLight,
    letterSpacing: typography.wide,
    marginBottom: 2,
  },
  matrixVal: {
    fontSize: typography.sm + 0.5,
    fontWeight: typography.bold,
    color: colors.textPrimary,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    paddingTop: spacing.sm + 2,
  },
  timestamp: {
    fontSize: typography.xs + 1,
    fontWeight: typography.semibold,
    color: colors.textLight,
  },
  actionGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  exitButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 1,
    borderRadius: radii.sm + 2,
    backgroundColor: colors.dangerBg,
  },
  exitText: {
    fontSize: typography.sm,
    fontWeight: typography.bold,
    color: colors.dangerText,
  },
  detailsButton: {
    width: 28,
    height: 28,
    borderRadius: radii.sm + 2,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  payoutText: {
    fontSize: typography.sm + 0.5,
    fontWeight: typography.black,
    color: colors.textPrimary,
  },
});
