import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

export default function EventFeedCard({ item }) {
  const handleOpenDetail = () => {
    router.push(`/event/${item.id}`);
  };

  const fill = Math.max(0, Math.min(100, Number.isFinite(Number(item.fillPercent)) ? Number(item.fillPercent) : 0));
  const prizeInr = item.prizePool || item.prizePoolInr || "₹1.0L";
  const prizeLabel = item.prizePoolLabel === "DEMO POOL"
    ? "DEMO PRIZE POOL"
    : item.prizePoolLabel || "PRIZE POOL";
  const entryInr = item.entry || item.entryInr || "₹199";
  const entryLabel = item.entryLabel || "ENTRY";
  const entrySubLabel = item.entrySubLabel || item.entryUsdt || "2.71 USDT";
  const players = Number.isFinite(Number(item.players))
    ? Number(item.players).toLocaleString("en-IN")
    : "—";
  const closesIn = item.closesIn || "00:00:00";
  const timeLabel = item.timeLabel || "CLOSES IN";
  const changeStr = item.change ? item.change.replace(/[+-]/g, "") : "0.84%";
  const isPos = item.isPositive !== false;
  const statusStyle =
    item.status === "LIVE"
      ? styles.statusPillLive
      : item.status === "SOON"
        ? styles.statusPillSoon
        : styles.statusPill;
  const statusTextStyle =
    item.status === "LIVE"
      ? styles.statusTextLive
      : item.status === "SOON"
        ? styles.statusTextSoon
        : styles.statusText;
  const accentColor = item.fillColor || (item.status === "LIVE"
    ? "#EF4444"
    : item.status === "SOON"
      ? "#F59E0B"
      : "#00C987");

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={handleOpenDetail}
      style={styles.cardWrapper}
    >
      <View style={[styles.card, { borderTopColor: accentColor }]}>
        {/* Top Header Row */}
        <View style={styles.headerRow}>
          {/* Top Left: Title, Status, Spot Price & Change */}
          <View style={styles.leftHeaderBlock}>
            <View style={styles.titleRow}>
              <Text numberOfLines={2} style={styles.title}>{item.title || "NIFTY 50"}</Text>
            </View>

            <View style={statusStyle}>
              <Text style={statusTextStyle}>{item.status || "OPEN"}</Text>
            </View>

            <View style={styles.priceRow}>
              <Text style={styles.spotPrice}>
                {item.currentPrice || "24,187.65"}
              </Text>
              <View style={styles.changePill}>
                <Text style={styles.changeText}>
                  {isPos ? "↗" : "↘"} {changeStr}
                </Text>
              </View>
            </View>
          </View>

          {/* Top Right: Prize Pool & USDT Badge */}
          <View style={styles.rightHeaderBlock}>
            <Text numberOfLines={2} style={styles.prizePoolAmount}>{prizeInr}</Text>
            <Text style={styles.prizePoolLabel}>{prizeLabel}</Text>
          </View>
        </View>

        {/* 3 Metrics: ENTRY | PLAYERS | CLOSES */}
        <View style={styles.metricsRow}>
          <View style={styles.metricCol}>
            <Text style={styles.metricLabel}>{entryLabel}</Text>
            <Text style={styles.metricValue}>{entryInr}</Text>
            <Text style={styles.metricSub}>{entrySubLabel}</Text>
          </View>

          <View style={styles.metricCol}>
            <Text style={styles.metricLabel}>PLAYERS</Text>
            <Text style={styles.metricValue}>{players}</Text>
          </View>

          <View style={[styles.metricCol, { alignItems: "flex-end" }]}>
            <Text style={styles.metricLabel}>{timeLabel}</Text>
            <Text style={styles.closesValue}>{closesIn}</Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBarTrack}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${fill}%`, backgroundColor: item.fillColor || "#00C987" },
            ]}
          />
        </View>

        {/* Footer: Fill percentage & View Contest Action */}
        <View style={styles.footerRow}>
          <Text style={styles.filledText}>{fill}% filled</Text>

          <View style={styles.viewContestBtn}>
            <Text style={styles.viewContestText}>View Contest</Text>
            <Ionicons name="chevron-forward" size={15} color="#00C987" style={{ marginTop: 1 }} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    marginBottom: 16,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 16,
    borderTopWidth: 3.5,
    borderTopColor: "#00C987",
    borderWidth: 1,
    borderColor: "#EAEFF5",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  leftHeaderBlock: {
    flex: 1,
    minWidth: 0,
    paddingRight: 12,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  title: {
    flexShrink: 1,
    fontSize: 22,
    fontWeight: "900",
    color: "#071329",
    letterSpacing: -0.4,
  },
  statusPill: {
    alignSelf: "flex-start",
    backgroundColor: "#E6FBF3",
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 12,
  },
  statusPillLive: {
    alignSelf: "flex-start",
    backgroundColor: "#FFF1F2",
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 12,
  },
  statusPillSoon: {
    alignSelf: "flex-start",
    backgroundColor: "#FFFBEB",
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10.5,
    fontWeight: "900",
    color: "#00C987",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  statusTextLive: {
    fontSize: 10.5,
    fontWeight: "900",
    color: "#E11D48",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  statusTextSoon: {
    fontSize: 10.5,
    fontWeight: "900",
    color: "#D97706",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 8,
  },
  spotPrice: {
    fontSize: 18,
    fontWeight: "800",
    color: "#071329",
    letterSpacing: -0.2,
  },
  changePill: {
    backgroundColor: "#E6FBF3",
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 8,
  },
  changeText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#00C987",
  },
  rightHeaderBlock: {
    alignItems: "flex-end",
    width: 142,
  },
  prizePoolAmount: {
    fontSize: 21,
    fontWeight: "900",
    color: "#F59E0B",
    letterSpacing: -0.5,
  },
  prizePoolLabel: {
    fontSize: 9.5,
    fontWeight: "800",
    color: "#94A3B8",
    letterSpacing: 0.8,
    marginTop: 3,
    textAlign: "right",
  },
  usdtPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E6FBF3",
    borderWidth: 1,
    borderColor: "#A7F3D0",
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    marginTop: 6,
  },
  usdtIconCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#00C987",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 5,
  },
  usdtIconText: {
    fontSize: 8.5,
    fontWeight: "900",
    color: "#FFFFFF",
    lineHeight: 11,
  },
  usdtAmountText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#059669",
  },
  metricsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderTopColor: "#EEF2F7",
    borderTopWidth: 1,
    marginTop: 18,
    paddingTop: 16,
    marginBottom: 16,
  },
  metricCol: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "#94A3B8",
    letterSpacing: 0.6,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: "900",
    color: "#071329",
    marginTop: 4,
  },
  metricSub: {
    fontSize: 10.5,
    fontWeight: "600",
    color: "#94A3B8",
    marginTop: 2,
  },
  closesValue: {
    fontSize: 16,
    fontWeight: "900",
    color: "#F59E0B",
    letterSpacing: 0.8,
    marginTop: 4,
  },
  progressBarTrack: {
    height: 4.5,
    backgroundColor: "#F1F5F9",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 12,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#00C987",
    borderRadius: 4,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  filledText: {
    fontSize: 11.5,
    fontWeight: "600",
    color: "#94A3B8",
  },
  viewContestBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  viewContestText: {
    fontSize: 15,
    fontWeight: "900",
    color: "#00C987",
  },
});
