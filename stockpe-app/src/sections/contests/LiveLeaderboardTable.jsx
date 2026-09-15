import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, radii, spacing, typography } from "../../theme";
import AppCard from "../../components/ui/AppCard";

export default function LiveLeaderboardTable({ userRank = 14, userPoints = 284.5 }) {
  const leaderboardData = [
    { rank: 1, name: "Arjun Mehta", points: 316.5, prize: "₹1,00,000", change: "▲ +2", isUser: false },
    { rank: 2, name: "Priya Sharma", points: 308.0, prize: "₹50,000", change: "▼ -1", isUser: false },
    { rank: 3, name: "Vikram R.", points: 301.2, prize: "₹25,000", change: "▲ +4", isUser: false },
    { rank: 4, name: "Sneha Patel", points: 298.0, prize: "₹5,000", change: "—", isUser: false },
    { rank: 14, name: "You (Alpha Team)", points: userPoints, prize: "₹1,000", change: "▲ +6", isUser: true },
    { rank: 15, name: "Rohan Gupta", points: 281.0, prize: "₹1,000", change: "▼ -3", isUser: false },
  ];

  return (
    <AppCard style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.colRank}>RANK</Text>
        <Text style={styles.colTrader}>TRADER</Text>
        <Text style={styles.colPoints}>POINTS</Text>
        <Text style={styles.colPrize}>WINNINGS</Text>
      </View>

      <View style={styles.list}>
        {leaderboardData.map((row) => (
          <View
            key={row.rank}
            style={[styles.row, row.isUser && styles.userRow]}
          >
            {/* Rank & Change */}
            <View style={styles.rankCol}>
              <Text
                style={[
                  styles.rankText,
                  row.rank <= 3 && styles.topRankText,
                  row.isUser && { color: colors.primary, fontWeight: typography.black },
                ]}
              >
                #{row.rank}
              </Text>
              <Text
                style={[
                  styles.changeText,
                  row.change.includes("+")
                    ? { color: colors.primary }
                    : row.change.includes("-")
                    ? { color: colors.danger }
                    : { color: colors.textMuted },
                ]}
              >
                {row.change}
              </Text>
            </View>

            {/* Trader */}
            <View style={styles.traderCol}>
              <Text
                style={[
                  styles.nameText,
                  row.isUser && { color: colors.primary, fontWeight: typography.black },
                ]}
                numberOfLines={1}
              >
                {row.name}
              </Text>
            </View>

            {/* Points */}
            <View style={styles.pointsCol}>
              <Text
                style={[
                  styles.pointsText,
                  row.isUser && { color: colors.primary, fontWeight: typography.black },
                ]}
              >
                {row.points.toFixed(1)}
              </Text>
            </View>

            {/* Prize */}
            <View style={styles.prizeCol}>
              <Text
                style={[
                  styles.prizeText,
                  row.rank === 1 && { color: colors.warning },
                  row.isUser && { color: colors.primary, fontWeight: typography.black },
                ]}
              >
                {row.prize}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.base,
  },
  header: {
    flexDirection: "row",
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    marginBottom: spacing.xs,
  },
  colRank: {
    width: 60,
    fontSize: typography.xs - 0.5,
    fontWeight: typography.black,
    color: colors.textLight,
  },
  colTrader: {
    flex: 1.5,
    fontSize: typography.xs - 0.5,
    fontWeight: typography.black,
    color: colors.textLight,
  },
  colPoints: {
    flex: 1,
    textAlign: "right",
    fontSize: typography.xs - 0.5,
    fontWeight: typography.black,
    color: colors.textLight,
  },
  colPrize: {
    flex: 1,
    textAlign: "right",
    fontSize: typography.xs - 0.5,
    fontWeight: typography.black,
    color: colors.textLight,
  },
  list: {
    gap: 2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  userRow: {
    backgroundColor: "#F0FDF4",
    paddingHorizontal: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.primary,
    marginVertical: 4,
  },
  rankCol: {
    width: 60,
  },
  rankText: {
    fontSize: typography.sm + 1,
    fontWeight: typography.bold,
    color: colors.textPrimary,
  },
  topRankText: {
    color: colors.warning,
    fontWeight: typography.black,
  },
  changeText: {
    fontSize: typography.xs - 1,
    fontWeight: typography.black,
    marginTop: 1,
  },
  traderCol: {
    flex: 1.5,
  },
  nameText: {
    fontSize: typography.sm + 0.5,
    fontWeight: typography.bold,
    color: colors.textPrimary,
  },
  pointsCol: {
    flex: 1,
    alignItems: "flex-end",
  },
  pointsText: {
    fontSize: typography.sm + 0.5,
    fontWeight: typography.bold,
    color: colors.textSecondary,
  },
  prizeCol: {
    flex: 1,
    alignItems: "flex-end",
  },
  prizeText: {
    fontSize: typography.sm + 0.5,
    fontWeight: typography.black,
    color: colors.textPrimary,
  },
});
