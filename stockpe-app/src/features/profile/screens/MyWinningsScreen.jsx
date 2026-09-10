import React from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUserWinnings } from "../hooks/useUserWinnings";
import WinningsSummaryCard from "../components/WinningsSummaryCard";

export default function MyWinningsScreen() {
  const router = useRouter();
  const { winningsData, isLoading } = useUserWinnings();

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
      <View style={styles.screen}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={22} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Winnings & Rewards</Text>
          <TouchableOpacity
            onPress={() => router.push("/wallet/history")}
            style={styles.historyBtn}
          >
            <Ionicons name="receipt-outline" size={20} color="#64748B" />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {isLoading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color="#00C987" />
            </View>
          ) : (
            <>
              {/* Comprehensive Summary Card */}
              <WinningsSummaryCard winningsData={winningsData} />

              {/* Hall of Fame / Top Wins */}
              <Text style={styles.sectionTitle}>BIGGEST WINS & MILESTONES</Text>

              {winningsData.topWins.map((win) => (
                <View key={win.id} style={styles.winCard}>
                  <View style={styles.winLeft}>
                    <View style={styles.trophyCircle}>
                      <Ionicons name="trophy" size={20} color="#F59E0B" />
                    </View>
                    <View style={styles.winInfo}>
                      <Text style={styles.winTitle}>{win.title}</Text>
                      <View style={styles.winMetaRow}>
                        <Text style={styles.winDate}>{win.date}</Text>
                        <View style={styles.winBadge}>
                          <Text style={styles.winBadgeText}>{win.badge}</Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  <View style={styles.winRight}>
                    <Text style={styles.winAmount}>
                      +₹{win.prizeInr.toLocaleString("en-IN")}
                    </Text>
                    <Text style={styles.winUsdt}>+{win.prizeUsdt} USDT</Text>
                  </View>
                </View>
              ))}

              {/* Withdraw Winnings CTA Card */}
              <View style={styles.withdrawCard}>
                <View style={styles.withdrawLeft}>
                  <Text style={styles.withdrawTitle}>Ready to cash out?</Text>
                  <Text style={styles.withdrawSub}>
                    Instant transfer to your verified HDFC bank account.
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.withdrawBtn}
                  onPress={() => router.push("/wallet/withdraw")}
                  activeOpacity={0.85}
                >
                  <Text style={styles.withdrawBtnText}>WITHDRAW</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  screen: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#EDF2F7",
  },
  backBtn: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#0F172A",
  },
  historyBtn: {
    padding: 6,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  loadingBox: {
    padding: 40,
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: "#64748B",
    letterSpacing: 0.8,
    marginBottom: 12,
    marginTop: 8,
  },
  winCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#EDF2F7",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1.5,
  },
  winLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 10,
  },
  trophyCircle: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#FEF3C7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  winInfo: {
    flex: 1,
  },
  winTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0F172A",
  },
  winMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  winDate: {
    fontSize: 11,
    color: "#94A3B8",
    fontWeight: "600",
  },
  winBadge: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  winBadgeText: {
    fontSize: 9.5,
    fontWeight: "800",
    color: "#475569",
  },
  winRight: {
    alignItems: "flex-end",
  },
  winAmount: {
    fontSize: 14.5,
    fontWeight: "900",
    color: "#00C987",
  },
  winUsdt: {
    fontSize: 10.5,
    fontWeight: "700",
    color: "#64748B",
  },
  withdrawCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#E6FBF3",
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  withdrawLeft: {
    flex: 1,
    marginRight: 12,
  },
  withdrawTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: "#059669",
  },
  withdrawSub: {
    fontSize: 11.5,
    color: "#047857",
    marginTop: 2,
  },
  withdrawBtn: {
    backgroundColor: "#00C987",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  withdrawBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
});
