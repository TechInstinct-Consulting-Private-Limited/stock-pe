import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function PlayerHeaderCard({ player }) {
  return (
    <View style={styles.card}>
      <View style={styles.mainRow}>
        {/* Avatar */}
        <View
          style={[
            styles.avatarCircle,
            { backgroundColor: player.avatarBg || "#DCFCE7" },
          ]}
        >
          <Text
            style={[
              styles.avatarText,
              { color: player.avatarColor || "#059669" },
            ]}
          >
            {player.initials}
          </Text>
        </View>

        {/* Info */}
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{player.name}</Text>
            {player.verified && (
              <Ionicons name="checkmark-circle" size={16} color="#00C987" />
            )}
          </View>
          <Text style={styles.tierText}>{player.tier}</Text>
          <Text style={styles.joinedText}>Member since {player.joinedDate}</Text>
        </View>

        {/* Rank Badge */}
        <View style={styles.rankBox}>
          <Text style={styles.rankLabel}>RANK</Text>
          <Text style={styles.rankVal}>#{player.rank}</Text>
        </View>
      </View>

      {/* 4-Column Performance Metrics */}
      <View style={styles.metricsGrid}>
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>WIN RATE</Text>
          <Text style={[styles.metricVal, { color: "#00C987" }]}>
            {player.winRatePercent}%
          </Text>
        </View>

        <View style={styles.metricDivider} />

        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>TOTAL EARNED</Text>
          <Text style={styles.metricVal}>
            ₹{(player.totalWinningsInr / 100000).toFixed(1)}L
          </Text>
        </View>

        <View style={styles.metricDivider} />

        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>ACCURACY</Text>
          <Text style={[styles.metricVal, { color: "#6366F1" }]}>
            {player.bestAccuracy}
          </Text>
        </View>

        <View style={styles.metricDivider} />

        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>WIN STREAK</Text>
          <Text style={[styles.metricVal, { color: "#EF4444" }]}>
            {player.activeStreak} 🔥
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#0F172A",
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  mainRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "900",
  },
  info: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  name: {
    fontSize: 16,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  tierText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#00C987",
    marginTop: 2,
  },
  joinedText: {
    fontSize: 11,
    color: "#94A3B8",
    marginTop: 2,
  },
  rankBox: {
    backgroundColor: "#1E293B",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#334155",
  },
  rankLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: "#94A3B8",
    letterSpacing: 0.5,
  },
  rankVal: {
    fontSize: 18,
    fontWeight: "900",
    color: "#F59E0B",
    marginTop: 1,
  },
  metricsGrid: {
    flexDirection: "row",
    backgroundColor: "#1E293B",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "space-between",
  },
  metricItem: {
    alignItems: "center",
    flex: 1,
  },
  metricLabel: {
    fontSize: 8.5,
    fontWeight: "800",
    color: "#94A3B8",
    letterSpacing: 0.5,
  },
  metricVal: {
    fontSize: 14,
    fontWeight: "900",
    color: "#FFFFFF",
    marginTop: 3,
  },
  metricDivider: {
    width: 1,
    height: 24,
    backgroundColor: "#334155",
  },
});
