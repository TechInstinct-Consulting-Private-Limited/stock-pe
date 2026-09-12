import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, radii, spacing, typography } from "../../../theme";
import AppCard from "../../../components/ui/AppCard";

export default function SentimentOddsMeter({ event }) {
  if (!event) return null;

  const yesPercent = event.yesProbability || 50;
  const noPercent = event.noProbability || 50;

  return (
    <AppCard style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Market Sentiment</Text>
        <Text style={styles.tradersCount}>
          {event.players?.toLocaleString()} Traders
        </Text>
      </View>

      <View style={styles.splitBar}>
        <View style={[styles.yesBar, { flex: yesPercent }]}>
          <Text style={styles.barText}>
            YES {yesPercent}% (₹{event.yesPrice})
          </Text>
        </View>
        <View style={[styles.noBar, { flex: noPercent }]}>
          <Text style={styles.barText}>
            NO {noPercent}% (₹{event.noPrice})
          </Text>
        </View>
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.base,
    fontWeight: typography.black,
    color: colors.textPrimary,
    letterSpacing: typography.wide,
  },
  tradersCount: {
    fontSize: typography.sm,
    fontWeight: typography.bold,
    color: colors.textMuted,
  },
  splitBar: {
    flexDirection: "row",
    height: 38,
    borderRadius: radii.md,
    overflow: "hidden",
    gap: 3,
  },
  yesBar: {
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.sm,
  },
  noBar: {
    backgroundColor: colors.danger,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.sm,
  },
  barText: {
    color: colors.textWhite,
    fontSize: typography.sm + 0.5,
    fontWeight: typography.black,
    letterSpacing: typography.wide,
  },
});
