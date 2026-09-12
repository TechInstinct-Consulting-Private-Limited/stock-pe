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
import { useReferAndEarn } from "../hooks/useReferAndEarn";
import ReferralCodeCard from "../components/ReferralCodeCard";
import ReferralStepsCard from "../components/ReferralStepsCard";

export default function ReferEarnScreen() {
  const router = useRouter();
  const { data, isLoading, copied, handleCopyCode } = useReferAndEarn();

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
          <Text style={styles.headerTitle}>Refer & Earn</Text>
          <View style={{ width: 34 }} />
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
              {/* Main Code & Share Card */}
              <ReferralCodeCard
                referralCode={data.referralCode}
                copied={copied}
                onCopyCode={handleCopyCode}
                rewardPerReferral={data.rewardPerReferralInr}
              />

              {/* Earnings Counter 2x2 Grid */}
              <View style={styles.statsCard}>
                <View style={styles.statCol}>
                  <Text style={styles.statLabel}>TOTAL EARNED</Text>
                  <Text style={[styles.statVal, { color: "#00C987" }]}>
                    ₹{data.totalBonusEarnedInr.toLocaleString("en-IN")}
                  </Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statCol}>
                  <Text style={styles.statLabel}>FRIENDS INVITED</Text>
                  <Text style={styles.statVal}>{data.totalReferralsCount}</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statCol}>
                  <Text style={styles.statLabel}>ACTIVE TRADERS</Text>
                  <Text style={[styles.statVal, { color: "#6366F1" }]}>
                    {data.activeTradersCount}
                  </Text>
                </View>
              </View>

              {/* Step By Step Instructions */}
              <ReferralStepsCard steps={data.steps} />

              {/* Friends Activity List */}
              <Text style={styles.sectionHeader}>INVITED FRIENDS</Text>

              {data.friendsList.map((friend) => (
                <View key={friend.id} style={styles.friendCard}>
                  <View style={styles.friendLeft}>
                    <View style={styles.avatarCircle}>
                      <Text style={styles.avatarText}>{friend.avatar}</Text>
                    </View>
                    <View>
                      <Text style={styles.friendName}>{friend.name}</Text>
                      <Text style={styles.friendDate}>Joined {friend.date}</Text>
                    </View>
                  </View>

                  <View style={styles.friendRight}>
                    <Text style={styles.bonusText}>+₹{friend.bonusInr}</Text>
                    <View
                      style={[
                        styles.statusBadge,
                        friend.status === "COMPLETED"
                          ? styles.statusCompleted
                          : styles.statusPending,
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          friend.status === "COMPLETED"
                            ? styles.statusCompletedText
                            : styles.statusPendingText,
                        ]}
                      >
                        {friend.status === "COMPLETED" ? "REWARDED" : "PENDING"}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
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
  statsCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#EDF2F7",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    justifyContent: "space-around",
    alignItems: "center",
  },
  statCol: {
    alignItems: "center",
    flex: 1,
  },
  statLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: "#94A3B8",
    letterSpacing: 0.5,
  },
  statVal: {
    fontSize: 16,
    fontWeight: "900",
    color: "#0F172A",
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: "#EDF2F7",
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: "800",
    color: "#64748B",
    letterSpacing: 0.8,
    marginBottom: 12,
    marginTop: 8,
  },
  friendCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#EDF2F7",
  },
  friendLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 13,
    fontWeight: "900",
    color: "#6366F1",
  },
  friendName: {
    fontSize: 13.5,
    fontWeight: "800",
    color: "#0F172A",
  },
  friendDate: {
    fontSize: 11,
    color: "#94A3B8",
    marginTop: 2,
  },
  friendRight: {
    alignItems: "flex-end",
  },
  bonusText: {
    fontSize: 13.5,
    fontWeight: "900",
    color: "#00C987",
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
    marginTop: 2,
  },
  statusCompleted: {
    backgroundColor: "#E6FBF3",
  },
  statusPending: {
    backgroundColor: "#FEF3C7",
  },
  statusText: {
    fontSize: 8.5,
    fontWeight: "900",
  },
  statusCompletedText: {
    color: "#00C987",
  },
  statusPendingText: {
    color: "#D97706",
  },
});
