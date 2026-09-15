import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function HeadToHeadComparisonCard({ player, currentUser }) {
  const comparisonRows = [
    {
      label: "Season Rank",
      playerVal: `#${player.rank}`,
      userVal: `#${currentUser.currentRank || 42}`,
      playerWins: player.rank < (currentUser.currentRank || 42),
    },
    {
      label: "Win Rate",
      playerVal: `${player.winRatePercent}%`,
      userVal: `${currentUser.winRatePercent || 31}%`,
      playerWins: player.winRatePercent > (currentUser.winRatePercent || 31),
    },
    {
      label: "Total Winnings",
      playerVal: `₹${(player.totalWinningsInr / 100000).toFixed(1)}L`,
      userVal: `₹${(currentUser.totalWinningsInr / 100000).toFixed(1)}L`,
      playerWins: player.totalWinningsInr > currentUser.totalWinningsInr,
    },
    {
      label: "Win Streak",
      playerVal: `${player.activeStreak} 🔥`,
      userVal: `${currentUser.streakDays || 7} 🔥`,
      playerWins: player.activeStreak > (currentUser.streakDays || 7),
    },
  ];

  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>HEAD-TO-HEAD COMPARISON</Text>

      {/* Header comparing Both Names */}
      <View style={styles.compareHeader}>
        <View style={styles.headerColLeft}>
          <Text style={styles.playerName}>{player.name}</Text>
          <Text style={styles.playerSub}>Rank #{player.rank}</Text>
        </View>

        <View style={styles.vsCircle}>
          <Text style={styles.vsText}>VS</Text>
        </View>

        <View style={styles.headerColRight}>
          <Text style={styles.userName}>You ({currentUser.fullName.split(" ")[0]})</Text>
          <Text style={styles.userSub}>Rank #{currentUser.currentRank || 42}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Comparison Rows */}
      {comparisonRows.map((row, index) => (
        <View key={index} style={styles.row}>
          <View style={styles.valLeft}>
            <Text
              style={[
                styles.valText,
                row.playerWins && styles.valTextWinning,
              ]}
            >
              {row.playerVal}
            </Text>
            {row.playerWins && (
              <Ionicons name="caret-back" size={12} color="#00C987" />
            )}
          </View>

          <Text style={styles.rowLabel}>{row.label}</Text>

          <View style={styles.valRight}>
            {!row.playerWins && (
              <Ionicons name="caret-forward" size={12} color="#00C987" />
            )}
            <Text
              style={[
                styles.valText,
                !row.playerWins && styles.valTextWinning,
              ]}
            >
              {row.userVal}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#EDF2F7",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: "#64748B",
    letterSpacing: 0.8,
    marginBottom: 14,
  },
  compareHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerColLeft: {
    flex: 1,
  },
  playerName: {
    fontSize: 13.5,
    fontWeight: "900",
    color: "#0F172A",
  },
  playerSub: {
    fontSize: 11,
    color: "#00C987",
    fontWeight: "700",
    marginTop: 1,
  },
  vsCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#0F172A",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 10,
  },
  vsText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "900",
  },
  headerColRight: {
    flex: 1,
    alignItems: "flex-end",
  },
  userName: {
    fontSize: 13.5,
    fontWeight: "900",
    color: "#0F172A",
  },
  userSub: {
    fontSize: 11,
    color: "#6366F1",
    fontWeight: "700",
    marginTop: 1,
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 7,
  },
  rowLabel: {
    fontSize: 11.5,
    fontWeight: "700",
    color: "#64748B",
  },
  valLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    width: "30%",
  },
  valRight: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 4,
    width: "30%",
  },
  valText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#475569",
  },
  valTextWinning: {
    color: "#00C987",
    fontWeight: "900",
  },
});
