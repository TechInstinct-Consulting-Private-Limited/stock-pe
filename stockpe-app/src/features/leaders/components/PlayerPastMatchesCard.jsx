import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function PlayerPastMatchesCard({ pastPicks }) {
  if (!pastPicks || pastPicks.length === 0) return null;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>RECENT COMPLETED CONTESTS</Text>
        <View style={styles.settledBadge}>
          <Text style={styles.settledBadgeText}>SETTLED</Text>
        </View>
      </View>

      <Text style={styles.subtitle}>
        Historic winning lineups and stock picks from previous matches.
      </Text>

      {pastPicks.map((match) => (
        <View key={match.id} style={styles.matchCard}>
          <View style={styles.matchTop}>
            <View style={styles.contestNameRow}>
              <Text style={styles.contestName}>{match.contestName}</Text>
              <Text style={styles.matchDate}>• {match.date}</Text>
            </View>
            <Text style={styles.prizeWon}>+{match.prizeInr}</Text>
          </View>

          <View style={styles.picksRow}>
            {/* Captain Pick */}
            <View style={styles.pickChip}>
              <View style={styles.captainBadge}>
                <Text style={styles.badgeText}>2x (C)</Text>
              </View>
              <Text style={styles.pickStockText}>{match.captain}</Text>
            </View>

            {/* Vice Captain Pick */}
            <View style={styles.pickChip}>
              <View style={styles.vcBadge}>
                <Text style={styles.badgeText}>1.5x (VC)</Text>
              </View>
              <Text style={styles.pickStockText}>{match.viceCaptain}</Text>
            </View>
          </View>

          <View style={styles.matchFooter}>
            <View style={styles.rankResultBadge}>
              <Ionicons name="trophy" size={12} color="#D97706" />
              <Text style={styles.rankResultText}>Finished {match.rank}</Text>
            </View>
            <Text style={styles.pointsText}>{match.points}</Text>
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
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#EDF2F7",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: "#64748B",
    letterSpacing: 0.8,
  },
  settledBadge: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  settledBadgeText: {
    fontSize: 8.5,
    fontWeight: "800",
    color: "#64748B",
  },
  subtitle: {
    fontSize: 11.5,
    color: "#94A3B8",
    marginTop: 3,
    marginBottom: 14,
  },
  matchCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  matchTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  contestNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flex: 1,
    marginRight: 8,
  },
  contestName: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0F172A",
  },
  matchDate: {
    fontSize: 11,
    color: "#94A3B8",
    fontWeight: "600",
  },
  prizeWon: {
    fontSize: 13,
    fontWeight: "900",
    color: "#00C987",
  },
  picksRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 10,
  },
  pickChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    gap: 6,
  },
  captainBadge: {
    backgroundColor: "#F59E0B",
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  vcBadge: {
    backgroundColor: "#6366F1",
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  badgeText: {
    fontSize: 8.5,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  pickStockText: {
    fontSize: 11.5,
    fontWeight: "700",
    color: "#334155",
  },
  matchFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#EDF2F7",
    paddingTop: 8,
  },
  rankResultBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  rankResultText: {
    fontSize: 9.5,
    fontWeight: "800",
    color: "#D97706",
  },
  pointsText: {
    fontSize: 11.5,
    fontWeight: "800",
    color: "#0F172A",
  },
});
