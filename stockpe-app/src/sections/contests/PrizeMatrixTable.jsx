import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, radii, spacing, typography } from "../../theme";
import AppCard from "../../components/ui/AppCard";

export default function PrizeMatrixTable({ prizeMatrix = [], rules = [] }) {
  return (
    <View style={styles.container}>
      {/* Prize Pool Breakdown Card */}
      <AppCard style={styles.card}>
        <View style={styles.headerRow}>
          <Text style={styles.colHeaderRank}>RANK</Text>
          <Text style={styles.colHeaderPrize}>PRIZE (INR / USDT)</Text>
        </View>

        <View style={styles.rowsContainer}>
          {prizeMatrix.map((item, idx) => {
            const isTopRank = idx === 0;
            return (
              <View
                key={idx}
                style={[styles.row, isTopRank && styles.topRankRow]}
              >
                <View style={styles.rankCell}>
                  {isTopRank && <Text style={styles.crownIcon}>👑 </Text>}
                  <Text
                    style={[
                      styles.rankText,
                      isTopRank && { color: colors.warning, fontWeight: typography.black },
                    ]}
                  >
                    {item.rank}
                  </Text>
                </View>

                <View style={styles.amountCell}>
                  <Text
                    style={[
                      styles.amountText,
                      isTopRank && { color: colors.primary, fontSize: typography.base },
                    ]}
                  >
                    {item.amount}
                  </Text>
                  <Text style={styles.usdtText}>{item.usdt}</Text>
                </View>
              </View>
            );
          })}
        </View>
      </AppCard>

      {/* Scoring System Card */}
      <AppCard style={styles.card}>
        <Text style={styles.sectionTitle}>Tournament Scoring Rules</Text>

        <View style={styles.rulesList}>
          {rules.map((rule, idx) => (
            <View key={idx} style={styles.ruleItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.ruleText}>{rule}</Text>
            </View>
          ))}
        </View>
      </AppCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  card: {
    marginBottom: spacing.xs,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    marginBottom: spacing.xs,
  },
  colHeaderRank: {
    fontSize: typography.xs,
    fontWeight: typography.black,
    color: colors.textLight,
    letterSpacing: typography.wide,
  },
  colHeaderPrize: {
    fontSize: typography.xs,
    fontWeight: typography.black,
    color: colors.textLight,
    letterSpacing: typography.wide,
  },
  rowsContainer: {
    gap: 2,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  topRankRow: {
    backgroundColor: "#FDFBE8",
    paddingHorizontal: spacing.sm,
    borderRadius: radii.sm,
    borderBottomWidth: 0,
    marginVertical: 2,
  },
  rankCell: {
    flexDirection: "row",
    alignItems: "center",
  },
  crownIcon: {
    fontSize: 13,
  },
  rankText: {
    fontSize: typography.sm + 0.5,
    fontWeight: typography.bold,
    color: colors.textPrimary,
  },
  amountCell: {
    alignItems: "flex-end",
  },
  amountText: {
    fontSize: typography.sm + 1,
    fontWeight: typography.black,
    color: colors.textPrimary,
  },
  usdtText: {
    fontSize: typography.xs,
    fontWeight: typography.semibold,
    color: colors.textMuted,
    marginTop: 1,
  },
  sectionTitle: {
    fontSize: typography.base,
    fontWeight: typography.black,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  rulesList: {
    gap: spacing.sm,
  },
  ruleItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  bullet: {
    fontSize: typography.base,
    color: colors.primary,
    fontWeight: typography.black,
    lineHeight: 18,
  },
  ruleText: {
    flex: 1,
    fontSize: typography.sm,
    fontWeight: typography.semibold,
    color: colors.textSecondary,
    lineHeight: 19,
  },
});
