import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import UsdtBadge from "../components/UsdtBadge";

export default function EventsScreen() {
  const [activeFilter, setActiveFilter] = useState("ALL");

  const filterTabs = ["ALL", "• LIVE", "OPEN", "SOON"];

  const eventsData = [
    {
      id: "nifty-50",
      title: "NIFTY 50",
      status: "OPEN",
      statusColor: "#00C987",
      statusBg: "#E6FBF3",
      price: "24,187.65",
      change: "+0.84%",
      isPositive: true,
      prizePoolInr: "₹1.0L",
      prizePoolUsdt: "13620.27",
      entryInr: "₹199",
      entryUsdt: "2.71 USDT",
      players: "8,431",
      closesIn: "03:00:29",
      fillPercent: 84,
      fillColor: "#00C987",
      topHighlight: null,
    },
    {
      id: "sensex",
      title: "SENSEX",
      status: "• LIVE",
      statusColor: "#EF4444",
      statusBg: "#FEE2E2",
      price: "79,432.18",
      change: "-0.31%",
      isPositive: false,
      prizePoolInr: "₹2.5L",
      prizePoolUsdt: "34050.67",
      entryInr: "₹299",
      entryUsdt: "4.07 USDT",
      players: "5,902",
      closesIn: "00:46:29",
      fillPercent: 74,
      fillColor: "#EF4444",
      topHighlight: "#EF4444",
    },
    {
      id: "bank-nifty",
      title: "BANK NIFTY",
      status: "OPEN",
      statusColor: "#00C987",
      statusBg: "#E6FBF3",
      price: "51,843.25",
      change: "+1.12%",
      isPositive: true,
      prizePoolInr: "₹500K",
      prizePoolUsdt: "6810.14",
      entryInr: "₹99",
      entryUsdt: "1.35 USDT",
      players: "12,410",
      closesIn: "05:12:00",
      fillPercent: 91,
      fillColor: "#00C987",
      topHighlight: null,
    },
  ];

  const filteredEvents = eventsData.filter((ev) => {
    if (activeFilter === "ALL") return true;
    if (activeFilter === "• LIVE") return ev.status.includes("LIVE");
    if (activeFilter === "OPEN") return ev.status === "OPEN";
    if (activeFilter === "SOON") return ev.status === "SOON";
    return true;
  });

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Dark Hero Metric Pool Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroStatsRow}>
            {/* Prize Pool */}
            <View style={styles.heroStatCol}>
              <Text style={styles.heroStatLabel}>PRIZE POOL</Text>
              <Text style={[styles.heroStatNumber, { color: "#00C987" }]}>
                ₹49.5L
              </Text>
              <Text style={styles.heroStatSub}>today</Text>
            </View>

            <View style={styles.statSeparator} />

            {/* Live Traders */}
            <View style={styles.heroStatCol}>
              <Text style={styles.heroStatLabel}>LIVE TRADERS</Text>
              <Text style={[styles.heroStatNumber, { color: "#38BDF8" }]}>
                23,490
              </Text>
              <Text style={styles.heroStatSub}>competing</Text>
            </View>

            <View style={styles.statSeparator} />

            {/* Paid Out */}
            <View style={styles.heroStatCol}>
              <Text style={styles.heroStatLabel}>PAID OUT</Text>
              <Text style={[styles.heroStatNumber, { color: "#FBBF24" }]}>
                ₹2.1Cr
              </Text>
              <Text style={styles.heroStatSub}>all time</Text>
            </View>
          </View>

          {/* USDT Conversion Sub-Banner */}
          <View style={styles.usdtConversionBar}>
            <View style={styles.usdtMiniIcon}>
              <Text style={styles.usdtMiniText}>₮</Text>
            </View>
            <Text style={styles.usdtConversionText}>
              1 USDT = ₹73.42{"   "}•{"   "}Live{"   "}•{"   "}All payouts in crypto
            </Text>
          </View>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterPillsRow}>
          {filterTabs.map((tab) => {
            const isSelected = activeFilter === tab;
            return (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.filterPill,
                  isSelected && styles.filterPillActive,
                ]}
                onPress={() => setActiveFilter(tab)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    isSelected && styles.filterPillTextActive,
                  ]}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Event Cards List */}
        <View style={styles.eventsList}>
          {filteredEvents.map((item) => (
            <View
              key={item.id}
              style={[
                styles.eventCard,
                item.topHighlight && {
                  borderTopColor: item.topHighlight,
                  borderTopWidth: 3,
                },
              ]}
            >
              {/* Header: Title & Prize Pool */}
              <View style={styles.cardHeaderRow}>
                <View style={styles.titleWithStatus}>
                  <Text style={styles.eventTitle}>{item.title}</Text>
                  <View
                    style={[
                      styles.statusPill,
                      { backgroundColor: item.statusBg },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusPillText,
                        { color: item.statusColor },
                      ]}
                    >
                      {item.status}
                    </Text>
                  </View>
                </View>

                <View style={styles.prizePoolBlock}>
                  <Text style={styles.prizeAmount}>{item.prizePoolInr}</Text>
                  <Text style={styles.prizeLabel}>PRIZE POOL</Text>
                  <UsdtBadge
                    amount={item.prizePoolUsdt}
                    style={{ marginTop: 4 }}
                  />
                </View>
              </View>

              {/* Price & Change Pill */}
              <View style={styles.priceSection}>
                <Text style={styles.currentPrice}>{item.price}</Text>
                <View
                  style={[
                    styles.changeBadge,
                    {
                      backgroundColor: item.isPositive
                        ? "#E6FBF3"
                        : "#FEE2E2",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.changeBadgeText,
                      { color: item.isPositive ? "#00C987" : "#EF4444" },
                    ]}
                  >
                    {item.isPositive ? "↗" : "↘"} {item.change}
                  </Text>
                </View>
              </View>

              {/* 3 Metrics (Entry, Players, Closes) */}
              <View style={styles.metricsGrid}>
                <View style={styles.metricColumn}>
                  <Text style={styles.metricHeading}>ENTRY</Text>
                  <Text style={styles.metricMain}>{item.entryInr}</Text>
                  <Text style={styles.metricSub}>{item.entryUsdt}</Text>
                </View>

                <View style={styles.metricColumn}>
                  <Text style={styles.metricHeading}>PLAYERS</Text>
                  <Text style={styles.metricMain}>{item.players}</Text>
                </View>

                <View style={[styles.metricColumn, { alignItems: "flex-end" }]}>
                  <Text style={styles.metricHeading}>CLOSES</Text>
                  <Text style={[styles.metricMain, { color: "#F59E0B" }]}>
                    {item.closesIn}
                  </Text>
                </View>
              </View>

              {/* Progress Track */}
              <View style={styles.progressContainer}>
                <View style={styles.progressBarBg}>
                  <View
                    style={[
                      styles.progressBarFill,
                      {
                        width: `${item.fillPercent}%`,
                        backgroundColor: item.fillColor,
                      },
                    ]}
                  />
                </View>
              </View>

              {/* Footer: % filled & View Contest Link */}
              <View style={styles.cardFooter}>
                <Text style={styles.filledLabel}>
                  {item.fillPercent}% filled
                </Text>

                <TouchableOpacity
                  style={styles.viewContestButton}
                  onPress={() => router.push("/(tabs)/leaders")}
                  activeOpacity={0.7}
                >
                  <Text style={styles.viewContestLabel}>View Contest</Text>
                  <Ionicons name="chevron-forward" size={14} color="#00C987" />
                </TouchableOpacity>
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

  /* Hero Metric Card */
  heroCard: {
    backgroundColor: "#060D1E",
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    shadowColor: "#060D1E",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
  },
  heroStatsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 14,
  },
  heroStatCol: {
    alignItems: "center",
    flex: 1,
  },
  heroStatLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: "#64748B",
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  heroStatNumber: {
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: -0.3,
  },
  heroStatSub: {
    fontSize: 10,
    fontWeight: "600",
    color: "#64748B",
    marginTop: 2,
  },
  statSeparator: {
    width: 1,
    height: 36,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  usdtConversionBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.08)",
    paddingTop: 12,
    marginTop: 2,
  },
  usdtMiniIcon: {
    width: 15,
    height: 15,
    borderRadius: 8,
    backgroundColor: "#00C987",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
  },
  usdtMiniText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "900",
  },
  usdtConversionText: {
    color: "#34D399",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.2,
  },

  /* Filter Pills */
  filterPillsRow: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#EDF2F7",
  },
  filterPill: {
    flex: 1,
    paddingVertical: 9,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },
  filterPillActive: {
    backgroundColor: "#00C987",
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#64748B",
    letterSpacing: 0.3,
  },
  filterPillTextActive: {
    color: "#FFFFFF",
  },

  /* Event Cards */
  eventsList: {
    gap: 14,
  },
  eventCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E8EDF5",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  titleWithStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  eventTitle: {
    fontSize: 19,
    fontWeight: "900",
    color: "#0F172A",
    letterSpacing: -0.2,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  prizePoolBlock: {
    alignItems: "flex-end",
  },
  prizeAmount: {
    fontSize: 19,
    fontWeight: "900",
    color: "#F59E0B",
    letterSpacing: -0.3,
  },
  prizeLabel: {
    fontSize: 8.5,
    fontWeight: "800",
    color: "#94A3B8",
    letterSpacing: 0.6,
  },

  /* Price Section */
  priceSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
    marginBottom: 14,
  },
  currentPrice: {
    fontSize: 15.5,
    fontWeight: "800",
    color: "#1E293B",
    letterSpacing: -0.2,
  },
  changeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  changeBadgeText: {
    fontSize: 10.5,
    fontWeight: "800",
  },

  /* 3-Column Metrics */
  metricsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  metricColumn: {
    flex: 1,
  },
  metricHeading: {
    fontSize: 9,
    fontWeight: "800",
    color: "#94A3B8",
    letterSpacing: 0.6,
    marginBottom: 3,
  },
  metricMain: {
    fontSize: 14.5,
    fontWeight: "800",
    color: "#0F172A",
  },
  metricSub: {
    fontSize: 9.5,
    fontWeight: "600",
    color: "#64748B",
    marginTop: 1,
  },

  /* Progress */
  progressContainer: {
    marginTop: 8,
    marginBottom: 8,
  },
  progressBarBg: {
    height: 5,
    backgroundColor: "#EDF2F7",
    borderRadius: 6,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 6,
  },

  /* Footer */
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 3,
  },
  filledLabel: {
    fontSize: 10.5,
    fontWeight: "700",
    color: "#94A3B8",
  },
  viewContestButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  viewContestLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: "#00C987",
  },
});
