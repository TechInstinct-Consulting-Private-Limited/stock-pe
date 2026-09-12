import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radii, shadows, spacing, typography } from "../../../theme";

export default function LiveLeaderboardView({ event }) {
  const leaders = [
    { rank: 1, name: "Arjun Mehta", initials: "AM", target: "24,215.00", delta: "+27.35 pts", points: 492.5, prize: "₹400K (5448 USDT)", isTop: true },
    { rank: 2, name: "Priya Sharma", initials: "PS", target: "24,200.00", delta: "+12.35 pts", points: 462.0, prize: "₹200K (2724 USDT)", isTop: true },
    { rank: 3, name: "Rohan Gupta", initials: "RG", target: "24,235.00", delta: "+47.35 pts", points: 438.5, prize: "₹150K (2043 USDT)", isTop: true },
    { rank: 4, name: "Ananya Roy", initials: "AR", target: "24,190.00", delta: "+2.35 pts", points: 412.0, prize: "₹50K (681 USDT)", isTop: false },
    { rank: 5, name: "Vikram Seth", initials: "VS", target: "24,250.00", delta: "+62.35 pts", points: 395.0, prize: "₹50K (681 USDT)", isTop: false },
    { rank: 6, name: "Kavita Rao", initials: "KR", target: "24,175.00", delta: "-12.65 pts", points: 378.0, prize: "₹20K (272 USDT)", isTop: false },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>LIVE TOURNAMENT STANDINGS</Text>
          <Text style={styles.headerSub}>Updated Real-Time</Text>
        </View>

        <View style={styles.list}>
          {leaders.map((item, idx) => (
            <View
              key={idx}
              style={[
                styles.row,
                idx !== leaders.length - 1 && styles.rowBorder,
                item.isTop && styles.topRowBg,
              ]}
            >
              <View style={styles.leftCol}>
                <View
                  style={[
                    styles.rankBadge,
                    item.rank === 1 && { backgroundColor: "#FEF3C7" },
                    item.rank === 2 && { backgroundColor: "#F1F5F9" },
                    item.rank === 3 && { backgroundColor: "#FFF7ED" },
                  ]}
                >
                  <Text
                    style={[
                      styles.rankText,
                      item.rank === 1 && { color: "#F59E0B" },
                      item.rank === 2 && { color: "#64748B" },
                      item.rank === 3 && { color: "#D97706" },
                    ]}
                  >
                    #{item.rank}
                  </Text>
                </View>

                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarText}>{item.initials}</Text>
                </View>

                <View>
                  <Text style={styles.playerName}>{item.name}</Text>
                  <Text style={styles.playerTarget}>
                    Target: ₹{item.target} ({item.delta})
                  </Text>
                </View>
              </View>

              <View style={styles.rightCol}>
                <Text style={styles.pointsText}>{item.points} pts</Text>
                <Text style={styles.prizeText}>{item.prize}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#EEF2F6",
    marginBottom: 20,
    ...shadows.sm,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  headerTitle: {
    fontSize: 10.5,
    fontWeight: "800",
    color: "#94A3B8",
    letterSpacing: 0.8,
  },
  headerSub: {
    fontSize: 11,
    fontWeight: "700",
    color: "#00C987",
  },
  list: {},
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  topRowBg: {},
  leftCol: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  rankBadge: {
    width: 28,
    height: 24,
    borderRadius: 6,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
  },
  rankText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#64748B",
  },
  avatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E0E7FF",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#4F46E5",
  },
  playerName: {
    fontSize: 13.5,
    fontWeight: "800",
    color: "#071329",
  },
  playerTarget: {
    fontSize: 10,
    fontWeight: "600",
    color: "#94A3B8",
    marginTop: 1,
  },
  rightCol: {
    alignItems: "flex-end",
  },
  pointsText: {
    fontSize: 14,
    fontWeight: "900",
    color: "#00C987",
  },
  prizeText: {
    fontSize: 9.5,
    fontWeight: "700",
    color: "#F59E0B",
    marginTop: 1,
  },
});
