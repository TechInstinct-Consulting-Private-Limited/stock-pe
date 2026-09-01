import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import UsdtBadge from "../components/UsdtBadge";

export default function LeadersScreen() {
  const [activeChip, setActiveChip] = useState("NIFTY");

  const chips = ["NIFTY", "SENSEX", "BANKNIFTY", "MIDCAP", "NIFTY IT"];

  const topThree = [
    {
      position: "1st",
      posColor: "#F59E0B",
      amountInr: "₹400K",
      amountUsdt: "5448.11",
      borderColor: "#FDE68A",
      bgColor: "#FFFBEB",
    },
    {
      position: "2nd",
      posColor: "#64748B",
      amountInr: "₹200K",
      amountUsdt: "2724.05",
      borderColor: "#E2E8F0",
      bgColor: "#F8FAFC",
    },
    {
      position: "3rd",
      posColor: "#EA580C",
      amountInr: "₹150K",
      amountUsdt: "2043.04",
      borderColor: "#FED7AA",
      bgColor: "#FFF7ED",
    },
  ];

  const rankings = [
    {
      rank: 1,
      rankBg: "#FEF3C7",
      rankColor: "#D97706",
      avatarBg: "#DCFCE7",
      avatarColor: "#059669",
      initials: "AM",
      name: "Arjun Mehta",
      prediction: "24,189.50",
      accuracy: "99.99%",
      usdt: "5448.11",
    },
    {
      rank: 2,
      rankBg: "#F1F5F9",
      rankColor: "#475569",
      avatarBg: "#E0F2FE",
      avatarColor: "#0284C7",
      initials: "PS",
      name: "Priya Sharma",
      prediction: "24,185.80",
      accuracy: "99.98%",
      usdt: "2724.05",
    },
    {
      rank: 3,
      rankBg: "#FFEDD5",
      rankColor: "#C2410C",
      avatarBg: "#E0E7FF",
      avatarColor: "#4F46E5",
      initials: "RG",
      name: "Rohan Gupta",
      prediction: "24,193.20",
      accuracy: "99.98%",
      usdt: "2043.04",
    },
    {
      rank: 4,
      rankBg: "#F1F5F9",
      rankColor: "#64748B",
      avatarBg: "#F3E8FF",
      avatarColor: "#9333EA",
      initials: "SP",
      name: "Sneha Patel",
      prediction: "24,178.80",
      accuracy: "99.96%",
      usdt: "1362.03",
    },
    {
      rank: 5,
      rankBg: "#F1F5F9",
      rankColor: "#64748B",
      avatarBg: "#DCFCE7",
      avatarColor: "#059669",
      initials: "VN",
      name: "Vikram Nair",
      prediction: "24,199.80",
      accuracy: "99.95%",
      usdt: "1021.52",
    },
    {
      rank: 6,
      rankBg: "#F1F5F9",
      rankColor: "#64748B",
      avatarBg: "#FEF3C7",
      avatarColor: "#D97706",
      initials: "AS",
      name: "Ananya Singh",
      prediction: "24,182.10",
      accuracy: "99.94%",
      usdt: "812.40",
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Chips Bar */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsScroll}
        >
          {chips.map((chip) => {
            const isActive = activeChip === chip;
            return (
              <TouchableOpacity
                key={chip}
                style={[
                  styles.chip,
                  isActive && styles.chipActive,
                ]}
                onPress={() => setActiveChip(chip)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.chipText,
                    isActive && styles.chipTextActive,
                  ]}
                >
                  {chip}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Header Info */}
        <View style={styles.headerInfoRow}>
          <View>
            <Text style={styles.mainTitle}>NIFTY 50</Text>
            <View style={styles.subInfoRow}>
              <Text style={styles.playersCount}>8,431 players</Text>
              <UsdtBadge amount="13620.27" />
            </View>
          </View>

          <View style={styles.closesRight}>
            <Text style={styles.closesLabel}>CLOSES IN</Text>
            <Text style={styles.closesTimer}>02:59:57</Text>
          </View>
        </View>

        {/* Top 3 Podium Cards */}
        <View style={styles.podiumRow}>
          {topThree.map((pod) => (
            <View
              key={pod.position}
              style={[
                styles.podiumCard,
                {
                  borderColor: pod.borderColor,
                  backgroundColor: pod.bgColor,
                },
              ]}
            >
              <Ionicons name="trophy-outline" size={22} color={pod.posColor} />
              <Text style={[styles.podiumPos, { color: pod.posColor }]}>
                {pod.position}
              </Text>
              <Text style={styles.podiumInr}>{pod.amountInr}</Text>
              <UsdtBadge amount={pod.amountUsdt} style={{ marginTop: 4 }} />
            </View>
          ))}
        </View>

        {/* Ranked Leaderboard List */}
        <View style={styles.rankingsList}>
          {rankings.map((item) => (
            <View key={item.rank} style={styles.rankCard}>
              {/* Rank Badge */}
              <View
                style={[
                  styles.rankBadge,
                  { backgroundColor: item.rankBg },
                ]}
              >
                <Text style={[styles.rankText, { color: item.rankColor }]}>
                  {item.rank}
                </Text>
              </View>

              {/* Avatar Initial */}
              <View
                style={[
                  styles.avatarCircle,
                  { backgroundColor: item.avatarBg },
                ]}
              >
                <Text style={[styles.avatarText, { color: item.avatarColor }]}>
                  {item.initials}
                </Text>
              </View>

              {/* Name & Prediction */}
              <View style={styles.nameBlock}>
                <Text style={styles.traderName}>{item.name}</Text>
                <Text style={styles.predictionText}>{item.prediction}</Text>
              </View>

              {/* Accuracy & USDT Prize */}
              <View style={styles.scoreBlock}>
                <Text style={styles.accuracyValue}>{item.accuracy}</Text>
                <UsdtBadge amount={item.usdt} style={{ marginTop: 2 }} />
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F6FB",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 32,
  },

  /* Chips */
  chipsScroll: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  chipActive: {
    backgroundColor: "#00C987",
    borderColor: "#00C987",
  },
  chipText: {
    fontSize: 11.5,
    fontWeight: "800",
    color: "#64748B",
  },
  chipTextActive: {
    color: "#FFFFFF",
  },

  /* Header Info */
  headerInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 16,
  },
  mainTitle: {
    fontSize: 21,
    fontWeight: "900",
    color: "#0F172A",
    letterSpacing: -0.2,
  },
  subInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  playersCount: {
    fontSize: 11.5,
    fontWeight: "700",
    color: "#64748B",
  },
  closesRight: {
    alignItems: "flex-end",
  },
  closesLabel: {
    fontSize: 8.5,
    fontWeight: "800",
    color: "#94A3B8",
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  closesTimer: {
    fontSize: 14.5,
    fontWeight: "900",
    color: "#F59E0B",
  },

  /* Podium */
  podiumRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 18,
  },
  podiumCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 6,
    borderRadius: 18,
    borderWidth: 1.5,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  podiumPos: {
    fontSize: 13,
    fontWeight: "900",
    marginTop: 4,
    marginBottom: 2,
  },
  podiumInr: {
    fontSize: 14,
    fontWeight: "900",
    color: "#0F172A",
    marginBottom: 2,
  },

  /* Rankings */
  rankingsList: {
    gap: 10,
  },
  rankCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#E8EDF5",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  rankBadge: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  rankText: {
    fontSize: 12,
    fontWeight: "900",
  },
  avatarCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: {
    fontSize: 11.5,
    fontWeight: "800",
  },
  nameBlock: {
    flex: 1,
  },
  traderName: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
  },
  predictionText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#94A3B8",
    marginTop: 1,
  },
  scoreBlock: {
    alignItems: "flex-end",
  },
  accuracyValue: {
    fontSize: 13.5,
    fontWeight: "900",
    color: "#00C987",
  },
});
