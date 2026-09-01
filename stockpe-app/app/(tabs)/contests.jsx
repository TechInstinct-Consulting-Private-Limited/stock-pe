import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import UsdtBadge from "../components/UsdtBadge";

export default function ContestsScreen() {
  const [activeTab, setActiveTab] = useState("ALL");

  const tabs = ["ALL", "ACTIVE", "WON 🏆", "LOST"];

  const contestsList = [
    {
      id: "nifty-it-1",
      title: "NIFTY IT",
      status: "WON",
      statusBadge: "WON 🏆",
      date: "31 Aug, 11:21 pm",
      winningsInr: "₹45K",
      winningsUsdt: "612.91",
      prediction: "38,750.00",
      entryFeeInr: "₹149",
      entryFeeUsdt: "2.03 USDT",
      accuracy: "99.97%",
      rank: "Rank #3",
      fillPercent: 99.97,
      isWon: true,
    },
    {
      id: "bank-nifty-1",
      title: "BANK NIFTY",
      status: "LOST",
      statusBadge: "LOST",
      date: "30 Aug, 11:21 pm",
      winningsInr: null,
      winningsUsdt: null,
      prediction: "51,800.00",
      entryFeeInr: "₹99",
      entryFeeUsdt: "1.35 USDT",
      accuracy: "98.50%",
      rank: null,
      fillPercent: 98.5,
      isWon: false,
    },
  ];

  const filteredContests = contestsList.filter((item) => {
    if (activeTab === "ALL") return true;
    if (activeTab === "ACTIVE") return item.status === "ACTIVE";
    if (activeTab === "WON 🏆") return item.status === "WON";
    if (activeTab === "LOST") return item.status === "LOST";
    return true;
  });

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Dark Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Text style={styles.sparkleIcon}>✨</Text>
            <Text style={styles.summaryTitle}>MY CONTEST SUMMARY</Text>
          </View>

          {/* Counts 4-Col */}
          <View style={styles.countsRow}>
            <View style={styles.countCol}>
              <Text style={styles.countNum}>2</Text>
              <Text style={styles.countLabel}>Joined</Text>
            </View>
            <View style={styles.countCol}>
              <Text style={styles.countNum}>0</Text>
              <Text style={styles.countLabel}>Active</Text>
            </View>
            <View style={styles.countCol}>
              <Text style={[styles.countNum, { color: "#00C987" }]}>1</Text>
              <Text style={styles.countLabel}>Won</Text>
            </View>
            <View style={styles.countCol}>
              <Text style={[styles.countNum, { color: "#EF4444" }]}>1</Text>
              <Text style={styles.countLabel}>Lost</Text>
            </View>
          </View>

          {/* Financials Row */}
          <View style={styles.financialsRow}>
            <View>
              <Text style={styles.finLabel}>Total Spent</Text>
              <Text style={styles.finValue}>₹248</Text>
            </View>
            <View style={{ alignItems: "center" }}>
              <Text style={styles.finLabel}>Total Won</Text>
              <Text style={[styles.finValue, { color: "#00C987" }]}>₹45,000</Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.finLabel}>Net P&L</Text>
              <Text style={[styles.finValue, { color: "#00C987", fontWeight: "900" }]}>
                +₹44,752
              </Text>
            </View>
          </View>
        </View>

        {/* Filter Pills */}
        <View style={styles.filterTabsContainer}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.filterTab,
                  isActive && styles.filterTabActive,
                ]}
                onPress={() => setActiveTab(tab)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.filterTabText,
                    isActive && styles.filterTabTextActive,
                  ]}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Contests List */}
        <View style={styles.contestsList}>
          {filteredContests.map((item) => (
            <View
              key={item.id}
              style={[
                styles.contestCard,
                item.isWon && { borderTopWidth: 3, borderTopColor: "#00C987" },
              ]}
            >
              {/* Card Header */}
              <View style={styles.cardTopRow}>
                <View>
                  <View style={styles.titleBadgeRow}>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <View
                      style={[
                        styles.badge,
                        item.isWon
                          ? styles.badgeWon
                          : styles.badgeLost,
                      ]}
                    >
                      <Text
                        style={[
                          styles.badgeText,
                          item.isWon
                            ? { color: "#00C987" }
                            : { color: "#64748B" },
                        ]}
                      >
                        {item.statusBadge}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.dateText}>{item.date}</Text>
                </View>

                {item.winningsInr && (
                  <View style={styles.winningsRight}>
                    <Text style={styles.winningsAmount}>
                      {item.winningsInr}
                    </Text>
                    <UsdtBadge
                      amount={item.winningsUsdt}
                      style={{ marginTop: 3 }}
                    />
                  </View>
                )}
              </View>

              {/* 3 Metrics */}
              <View style={styles.metricsGrid}>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>PREDICTION</Text>
                  <Text style={styles.metricValue}>{item.prediction}</Text>
                </View>

                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>ENTRY FEE</Text>
                  <Text style={styles.metricValue}>{item.entryFeeInr}</Text>
                  <Text style={styles.metricSub}>{item.entryFeeUsdt}</Text>
                </View>

                <View style={[styles.metricItem, { alignItems: "flex-end" }]}>
                  <Text style={styles.metricLabel}>ACCURACY</Text>
                  <Text
                    style={[
                      styles.metricValue,
                      { color: item.isWon ? "#00C987" : "#0F172A" },
                    ]}
                  >
                    {item.accuracy}
                  </Text>
                  {item.rank && (
                    <Text style={styles.rankSubText}>{item.rank}</Text>
                  )}
                </View>
              </View>

              {/* Accuracy Bar */}
              <View style={styles.accuracyBarTrack}>
                <View
                  style={[
                    styles.accuracyBarFill,
                    {
                      width: `${item.fillPercent}%`,
                      backgroundColor: item.isWon ? "#00C987" : "#94A3B8",
                    },
                  ]}
                />
              </View>
              <View style={styles.accuracyFooter}>
                <Text style={styles.accuracyFooterLabel}>Accuracy</Text>
                <Text style={styles.accuracyFooterValue}>{item.accuracy}</Text>
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

  /* Dark Summary Card */
  summaryCard: {
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
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    gap: 6,
  },
  sparkleIcon: {
    fontSize: 12,
  },
  summaryTitle: {
    fontSize: 10,
    fontWeight: "800",
    color: "#94A3B8",
    letterSpacing: 1,
  },
  countsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.08)",
  },
  countCol: {
    alignItems: "center",
    flex: 1,
  },
  countNum: {
    fontSize: 22,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: -0.3,
  },
  countLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "#64748B",
    marginTop: 2,
  },
  financialsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 14,
  },
  finLabel: {
    fontSize: 9.5,
    fontWeight: "700",
    color: "#64748B",
    marginBottom: 2,
  },
  finValue: {
    fontSize: 15.5,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  /* Filter Tabs */
  filterTabsContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#EDF2F7",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 9,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },
  filterTabActive: {
    backgroundColor: "#00C987",
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#64748B",
  },
  filterTabTextActive: {
    color: "#FFFFFF",
  },

  /* Contest Cards */
  contestsList: {
    gap: 14,
  },
  contestCard: {
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
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  titleBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardTitle: {
    fontSize: 19,
    fontWeight: "900",
    color: "#0F172A",
    letterSpacing: -0.2,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  badgeWon: {
    backgroundColor: "#E6FBF3",
  },
  badgeLost: {
    backgroundColor: "#F1F5F9",
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "800",
  },
  dateText: {
    fontSize: 10.5,
    fontWeight: "600",
    color: "#94A3B8",
    marginTop: 3,
  },
  winningsRight: {
    alignItems: "flex-end",
  },
  winningsAmount: {
    fontSize: 19,
    fontWeight: "900",
    color: "#F59E0B",
    letterSpacing: -0.3,
  },
  metricsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  metricItem: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: "#94A3B8",
    letterSpacing: 0.6,
    marginBottom: 3,
  },
  metricValue: {
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
  rankSubText: {
    fontSize: 9.5,
    fontWeight: "800",
    color: "#F59E0B",
    marginTop: 1,
  },
  accuracyBarTrack: {
    height: 5,
    backgroundColor: "#EDF2F7",
    borderRadius: 6,
    marginTop: 8,
    overflow: "hidden",
  },
  accuracyBarFill: {
    height: "100%",
    borderRadius: 6,
  },
  accuracyFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  accuracyFooterLabel: {
    fontSize: 9.5,
    fontWeight: "600",
    color: "#94A3B8",
  },
  accuracyFooterValue: {
    fontSize: 9.5,
    fontWeight: "800",
    color: "#64748B",
  },
});
