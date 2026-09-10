import React, { useState, useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { colors, radii, shadows, spacing, typography } from "../../../theme";

export default function EventDetailHero({ event }) {
  const [secondsLeft, setSecondsLeft] = useState(3 * 3600 + 16 * 60 + 56);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const hrs = String(Math.floor(secondsLeft / 3600)).padStart(2, "0");
  const mins = String(Math.floor((secondsLeft % 3600) / 60)).padStart(2, "0");
  const secs = String(secondsLeft % 60).padStart(2, "0");

  const title = event?.title || "NIFTY 50";
  const status = event?.status || "OPEN";
  const spotPrice = event?.currentPrice || "24,187.65";
  const change = event?.change || "+0.84%";
  const prizePoolInr = event?.prizePoolInr || "₹1.0L";
  const prizePoolUsdt = event?.prizePoolUsdt || "13628.27";
  const entryInr = event?.entryInr || "₹199";
  const entryUsdt = event?.entryUsdt || "2.71 USDT";
  const players = event?.players ? Number(event?.players).toLocaleString() : "8,431";
  const fill = event?.fillPercent || 84;

  return (
    <View style={styles.container}>
      {/* Top Bar: Back Circle, Title + Status, Subtitle, Bell Notification */}
      <View style={styles.navBar}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.navCenter}>
          <View style={styles.titleRow}>
            <Text style={styles.navTitle}>{title}</Text>
            <View style={styles.openPill}>
              <Text style={styles.openPillText}>{status}</Text>
            </View>
          </View>
          <Text style={styles.navSub}>Index • NSE India</Text>
        </View>

        <TouchableOpacity style={styles.bellBtn} activeOpacity={0.7}>
          <Ionicons name="notifications-outline" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Main Spot Price & Prize Pool Hero */}
      <View style={styles.spotHeroRow}>
        <View style={styles.spotLeft}>
          <Text style={styles.spotPriceText}>{spotPrice}</Text>
          <View style={styles.changeTag}>
            <Text style={styles.changeTagText}>↗ {change} today</Text>
          </View>
        </View>

        <View style={styles.prizeRight}>
          <Text style={styles.prizePoolText}>{prizePoolInr}</Text>
          <Text style={styles.prizePoolLabel}>PRIZE POOL</Text>
          <View style={styles.usdtCapsule}>
            <View style={styles.usdtIconCircle}>
              <Text style={styles.usdtIconText}>₮</Text>
            </View>
            <Text style={styles.usdtAmountText}>
              {prizePoolUsdt} {prizePoolUsdt.includes("USDT") ? "" : "USDT"}
            </Text>
          </View>
        </View>
      </View>

      {/* Digital Countdown Timer Card (CLOSES IN) */}
      <View style={styles.timerCard}>
        <View style={styles.timerHeader}>
          <Ionicons name="time-outline" size={14} color="#D97706" />
          <Text style={styles.timerLabel}>CLOSES IN</Text>
        </View>

        <View style={styles.timerDigitsRow}>
          <View style={styles.digitBox}>
            <Text style={styles.digitNumber}>{hrs}</Text>
            <Text style={styles.digitSub}>HRS</Text>
          </View>
          <Text style={styles.colonSeparator}>:</Text>
          <View style={styles.digitBox}>
            <Text style={styles.digitNumber}>{mins}</Text>
            <Text style={styles.digitSub}>MIN</Text>
          </View>
          <Text style={styles.colonSeparator}>:</Text>
          <View style={styles.digitBox}>
            <Text style={styles.digitNumber}>{secs}</Text>
            <Text style={styles.digitSub}>SEC</Text>
          </View>
        </View>
      </View>

      {/* 4-Column Quick Metrics Grid */}
      <View style={styles.metricsGrid}>
        <View style={styles.metricItem}>
          <View style={styles.metricLabelRow}>
            <Text style={styles.metricIcon}>₹</Text>
            <Text style={styles.metricTitle}>ENTRY</Text>
          </View>
          <Text style={styles.metricVal}>{entryInr}</Text>
          <Text style={styles.metricSub}>{entryUsdt}</Text>
        </View>

        <View style={styles.metricDivider} />

        <View style={styles.metricItem}>
          <View style={styles.metricLabelRow}>
            <Ionicons name="people-outline" size={11} color="#00C987" />
            <Text style={styles.metricTitle}>PLAYERS</Text>
          </View>
          <Text style={styles.metricVal}>{players}</Text>
          <Text style={styles.metricSub}>of 10,000</Text>
        </View>

        <View style={styles.metricDivider} />

        <View style={styles.metricItem}>
          <View style={styles.metricLabelRow}>
            <Ionicons name="water-outline" size={11} color="#00C987" />
            <Text style={styles.metricTitle}>FILLED</Text>
          </View>
          <Text style={styles.metricVal}>{fill}%</Text>
          <Text style={styles.metricSub}>capacity</Text>
        </View>

        <View style={styles.metricDivider} />

        <View style={styles.metricItem}>
          <View style={styles.metricLabelRow}>
            <Ionicons name="trophy-outline" size={11} color="#00C987" />
            <Text style={styles.metricTitle}>MAX WIN</Text>
          </View>
          <Text style={styles.metricVal}>₹400K</Text>
          <Text style={styles.metricSub}>5448.11 USDT</Text>
        </View>
      </View>

      {/* Green Accent Line */}
      <View style={styles.accentLine} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    ...shadows.sm,
  },
  navCenter: {
    alignItems: "center",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  navTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#071329",
    letterSpacing: -0.3,
  },
  openPill: {
    backgroundColor: "#E6FBF3",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  openPillText: {
    fontSize: 10,
    fontWeight: "900",
    color: "#00C987",
    letterSpacing: 0.5,
  },
  navSub: {
    fontSize: 11,
    fontWeight: "600",
    color: "#94A3B8",
    marginTop: 1,
  },
  bellBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  spotHeroRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  spotLeft: {},
  spotPriceText: {
    fontSize: 34,
    fontWeight: "900",
    color: "#071329",
    letterSpacing: -0.8,
  },
  changeTag: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  changeTagText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#00C987",
  },
  prizeRight: {
    alignItems: "flex-end",
  },
  prizePoolText: {
    fontSize: 26,
    fontWeight: "900",
    color: "#F59E0B",
    letterSpacing: -0.5,
  },
  prizePoolLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: "#94A3B8",
    letterSpacing: 0.8,
    marginTop: 1,
  },
  usdtCapsule: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E6FBF3",
    borderWidth: 1,
    borderColor: "#A7F3D0",
    borderRadius: 14,
    paddingHorizontal: 7,
    paddingVertical: 3,
    marginTop: 4,
  },
  usdtIconCircle: {
    width: 13,
    height: 13,
    borderRadius: 6.5,
    backgroundColor: "#00C987",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 4,
  },
  usdtIconText: {
    fontSize: 8,
    fontWeight: "900",
    color: "#FFFFFF",
    lineHeight: 10,
  },
  usdtAmountText: {
    fontSize: 10.5,
    fontWeight: "800",
    color: "#059669",
  },
  timerCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#EEF2F6",
    marginBottom: 16,
    alignItems: "center",
    ...shadows.sm,
  },
  timerHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 8,
  },
  timerLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "#64748B",
    letterSpacing: 0.8,
  },
  timerDigitsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  digitBox: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    width: 62,
    height: 54,
    alignItems: "center",
    justifyContent: "center",
  },
  digitNumber: {
    fontSize: 22,
    fontWeight: "900",
    color: "#F59E0B",
    letterSpacing: -0.5,
  },
  digitSub: {
    fontSize: 8.5,
    fontWeight: "800",
    color: "#94A3B8",
    letterSpacing: 0.5,
  },
  colonSeparator: {
    fontSize: 18,
    fontWeight: "900",
    color: "#CBD5E1",
    marginBottom: 10,
  },
  metricsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#EEF2F6",
    marginBottom: 14,
    ...shadows.sm,
  },
  metricItem: {
    flex: 1,
    alignItems: "center",
  },
  metricLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginBottom: 3,
  },
  metricIcon: {
    fontSize: 9,
    fontWeight: "900",
    color: "#00C987",
  },
  metricTitle: {
    fontSize: 8.5,
    fontWeight: "800",
    color: "#94A3B8",
    letterSpacing: 0.5,
  },
  metricVal: {
    fontSize: 14.5,
    fontWeight: "900",
    color: "#071329",
  },
  metricSub: {
    fontSize: 9,
    fontWeight: "600",
    color: "#94A3B8",
    marginTop: 1,
  },
  metricDivider: {
    width: 1,
    height: 28,
    backgroundColor: "#F1F5F9",
  },
  accentLine: {
    height: 3,
    backgroundColor: "#00C987",
    borderRadius: 2,
    marginHorizontal: 4,
  },
});
