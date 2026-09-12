import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radii, shadows, spacing, typography } from "../../../theme";

export default function ContestRulesView({ event }) {
  const steps = [
    {
      num: "01",
      title: "Pay Entry Fee",
      desc: `Pay ${event?.entryInr || "₹199"} (${event?.entryUsdt || "2.71 USDT"}) from your wallet.`,
      icon: "wallet-outline",
      iconColor: "#00C987",
      iconBg: "#E6FBF3",
    },
    {
      num: "02",
      title: "Submit Prediction",
      desc: "Enter your closing value: 23,000.00 – 26,000.00.",
      icon: "locate-outline",
      iconColor: "#6366F1",
      iconBg: "#EEF2FF",
    },
    {
      num: "03",
      title: "Wait for Close",
      desc: "Market closes 3:30 PM IST. Prediction locked on submit.",
      icon: "time-outline",
      iconColor: "#F59E0B",
      iconBg: "#FEF3C7",
    },
    {
      num: "04",
      title: "Results",
      desc: "Closest prediction wins. Ties by earliest submission.",
      icon: "stats-chart-outline",
      iconColor: "#8B5CF6",
      iconBg: "#F3E8FF",
    },
    {
      num: "05",
      title: "Win Prizes",
      desc: "Top 100 win. USDT auto-credited to your wallet.",
      icon: "trophy-outline",
      iconColor: "#D97706",
      iconBg: "#FEF3C7",
    },
  ];

  const contestRules = [
    "One prediction per user — no edits after submission",
    "Ties broken by earliest submission timestamp",
    "20% platform commission on gross winnings",
    "Min withdrawal: 10 USDT",
    "Must complete Aadhaar KYC to withdraw",
  ];

  return (
    <View style={styles.container}>
      {/* About This Contest Card */}
      <View style={styles.aboutCard}>
        <Text style={styles.aboutTitle}>About This Contest</Text>
        <Text style={styles.aboutDesc}>
          India's benchmark large-cap index tracking 50 stocks across key sectors of the economy.
        </Text>

        <View style={styles.tagsRow}>
          <View style={[styles.tagPill, { backgroundColor: "#E6FBF3" }]}>
            <Text style={[styles.tagPillText, { color: "#00C987" }]}>Index</Text>
          </View>
          <View style={[styles.tagPill, { backgroundColor: "#EEF2FF" }]}>
            <Text style={[styles.tagPillText, { color: "#6366F1" }]}>NSE • BSE</Text>
          </View>
          <View style={[styles.tagPill, { backgroundColor: "#FEF3C7" }]}>
            <Text style={[styles.tagPillText, { color: "#D97706" }]}>Closes 3:30 PM IST</Text>
          </View>
        </View>
      </View>

      {/* HOW TO PLAY Sequence */}
      <Text style={styles.sectionHeader}>HOW TO PLAY</Text>
      <View style={styles.stepsList}>
        {steps.map((s, idx) => (
          <View key={idx} style={styles.stepCard}>
            <View style={[styles.stepIconCircle, { backgroundColor: s.iconBg }]}>
              <Ionicons name={s.icon} size={18} color={s.iconColor} />
            </View>
            <View style={styles.stepTextContent}>
              <Text style={styles.stepTitle}>
                <Text style={styles.stepNum}>{s.num}  </Text>
                {s.title}
              </Text>
              <Text style={styles.stepDesc}>{s.desc}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* CONTEST RULES Card */}
      <View style={styles.rulesCard}>
        <Text style={styles.rulesHeader}>CONTEST RULES</Text>
        <View style={styles.rulesList}>
          {contestRules.map((rule, idx) => (
            <View key={idx} style={styles.ruleItem}>
              <View style={styles.checkCircle}>
                <Ionicons name="checkmark" size={11} color="#00C987" />
              </View>
              <Text style={styles.ruleText}>{rule}</Text>
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
  aboutCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#EEF2F6",
    marginBottom: 20,
    ...shadows.sm,
  },
  aboutTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#071329",
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  aboutDesc: {
    fontSize: 13,
    fontWeight: "500",
    color: "#64748B",
    lineHeight: 19,
    marginBottom: 14,
  },
  tagsRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  tagPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagPillText: {
    fontSize: 11,
    fontWeight: "800",
  },
  sectionHeader: {
    fontSize: 10.5,
    fontWeight: "800",
    color: "#94A3B8",
    letterSpacing: 0.8,
    marginBottom: 12,
    marginLeft: 2,
  },
  stepsList: {
    gap: 10,
    marginBottom: 24,
  },
  stepCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "#EEF2F6",
    gap: 12,
    ...shadows.sm,
  },
  stepIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  stepTextContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#071329",
  },
  stepNum: {
    fontSize: 11,
    fontWeight: "800",
    color: "#94A3B8",
  },
  stepDesc: {
    fontSize: 11.5,
    fontWeight: "500",
    color: "#64748B",
    marginTop: 2,
    lineHeight: 16,
  },
  rulesCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#EEF2F6",
    marginBottom: 20,
    ...shadows.sm,
  },
  rulesHeader: {
    fontSize: 10.5,
    fontWeight: "800",
    color: "#94A3B8",
    letterSpacing: 0.8,
    marginBottom: 14,
  },
  rulesList: {
    gap: 12,
  },
  ruleItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  checkCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#E6FBF3",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  ruleText: {
    flex: 1,
    fontSize: 12.5,
    fontWeight: "600",
    color: "#475569",
    lineHeight: 18,
  },
});
