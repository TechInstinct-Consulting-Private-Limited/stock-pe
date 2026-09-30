import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { removeAuthToken } from "../../src/services/authStorage";
import { useProfileSummary } from "../../src/features/profile/hooks/useProfileSummary";

export default function ProfileScreen() {
  const router = useRouter();
  const profile = useProfileSummary();
  const user = profile?.user;
  const stats = profile?.stats;
  const initials = user?.displayName?.split(" ").map((part) => part[0]).join("").slice(0, 2) || "SP";

  const handleLogout = async () => {
    await removeAuthToken();
    router.replace("/login");
  };

  const menuItems = [
    {
      id: "predictions",
      title: "My Predictions",
      icon: "stats-chart-outline",
      iconColor: "#6366F1",
      bgColor: "#EEF2FF",
      route: "/profile/predictions",
    },
    {
      id: "winnings",
      title: "My Demo Rewards",
      icon: "trophy-outline",
      iconColor: "#F59E0B",
      bgColor: "#FEF3C7",
      route: "/profile/winnings",
    },
    {
      id: "kyc",
      title: "KYC & Security",
      icon: "shield-checkmark-outline",
      iconColor: "#00C987",
      bgColor: "#E6FBF3",
      route: "/profile/kyc",
    },
    {
      id: "refer",
      title: "Refer & Earn (Coming soon)",
      icon: "gift-outline",
      iconColor: "#EC4899",
      bgColor: "#FDF2F8",
      route: "/support/refer-earn",
    },
    {
      id: "help",
      title: "Help & 24x7 Support",
      icon: "headset-outline",
      iconColor: "#06B6D4",
      bgColor: "#ECFEFF",
      route: "/support/faq",
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Dark Profile Header Card */}
        <View style={styles.profileHeaderCard}>
          <View style={styles.profileMainRow}>
            {/* Avatar with Checkmark */}
            <View style={styles.avatarWrapper}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
              <View style={styles.verifiedCheckBadge}>
                <Ionicons name="checkmark" size={10} color="#FFFFFF" />
              </View>
            </View>

            {/* Name & Details */}
            <View style={styles.profileDetails}>
              <Text style={styles.userName}>{user?.displayName || "StockPe Member"}</Text>
              <Text style={styles.userPhone}>{user?.mobile ? `+91-${user.mobile}` : "Loading profile…"}</Text>

              {/* Badges */}
              <View style={styles.badgesRow}>
                <TouchableOpacity
                  style={styles.kycBadge}
                  activeOpacity={0.7}
                  onPress={() => router.push("/profile/kyc")}
                >
                  <Ionicons name="checkmark-circle" size={11} color="#00C987" />
                  <Text style={styles.kycBadgeText}>{user?.kycVerified ? "KYC" : "KYC PENDING"}</Text>
                </TouchableOpacity>

                <View style={styles.usdtBadgePill}>
                  <Text style={styles.usdtIconText}>₮</Text>
                  <Text style={styles.usdtBadgeText}>{user?.walletLinked ? "WALLET" : "WALLET PENDING"}</Text>
                </View>
              </View>
            </View>

            {/* Bell Icon */}
            <TouchableOpacity
              style={styles.bellButton}
              activeOpacity={0.7}
              onPress={() => router.push("/profile/notifications")}
            >
              <Ionicons
                name="notifications-outline"
                size={20}
                color="#94A3B8"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* 2x2 Stats Grid */}
        <View style={styles.statsGrid}>
          {/* Total Events */}
          <TouchableOpacity
            style={styles.statCard}
            activeOpacity={0.7}
            onPress={() => router.push("/profile/predictions")}
          >
            <Text style={styles.statCardLabel}>DEMO CONTESTS</Text>
            <Text style={styles.statCardValue}>{stats?.totalContests ?? "—"}</Text>
            <Text style={styles.statCardSub}>Participated</Text>
          </TouchableOpacity>

          {/* Win Rate */}
          <TouchableOpacity
            style={styles.statCard}
            activeOpacity={0.7}
            onPress={() => router.push("/profile/predictions")}
          >
            <Text style={styles.statCardLabel}>WIN RATE</Text>
            <Text style={[styles.statCardValue, { color: "#00C987" }]}>{stats?.winRate ?? 0}%</Text>
            <Text style={styles.statCardSub}>{stats?.wonContests ?? 0} wins</Text>
          </TouchableOpacity>

          {/* Winnings */}
          <TouchableOpacity
            style={styles.statCard}
            activeOpacity={0.7}
            onPress={() => router.push("/profile/winnings")}
          >
            <Text style={styles.statCardLabel}>DEMO REWARDS</Text>
            <Text style={[styles.statCardValue, { color: "#F59E0B" }]}>{stats?.totalRewardCredits ?? 0}</Text>
            <Text style={styles.statCardSub}>Non-withdrawable credits</Text>
          </TouchableOpacity>

          {/* Best Accuracy */}
          <TouchableOpacity
            style={styles.statCard}
            activeOpacity={0.7}
            onPress={() => router.push("/profile/predictions")}
          >
            <Text style={styles.statCardLabel}>ACTIVE ENTRIES</Text>
            <Text style={[styles.statCardValue, { color: "#6366F1" }]}>
              {stats?.activeContests ?? 0}
            </Text>
            <Text style={styles.statCardSub}>Current demo contests</Text>
          </TouchableOpacity>
        </View>

        {/* Current Rank Card */}
        <View style={styles.rankCard}>
          <View style={styles.rankTopRow}>
            <View style={styles.rankTrophyCircle}>
              <Ionicons name="trophy-outline" size={24} color="#F59E0B" />
            </View>
            <View style={styles.rankTextContainer}>
              <Text style={styles.rankLabel}>DEMO PROGRESS</Text>
              <Text style={styles.rankTitle}>{stats?.wonContests ?? 0} CONTEST WINS</Text>
              <Text style={styles.rankSubText}>
                {stats?.lostContests ?? 0} settled without a reward
              </Text>
            </View>
          </View>

          {/* XP Progress */}
          <View style={styles.xpProgressTrack}>
            <View
              style={[
                styles.xpProgressFill,
                { width: `${Math.min(100, (stats?.winRate ?? 0))}%` },
              ]}
            />
          </View>
          <View style={styles.xpFooter}>
            <Text style={styles.xpCurrent}>{stats?.winRate ?? 0}% win rate</Text>
            <Text style={styles.xpToGo}>Demo mode</Text>
          </View>
        </View>

        <View style={styles.guideCard}>
          <View style={styles.guideIconCircle}>
            <Ionicons name="arrow-down-circle" size={26} color="#00C987" />
          </View>
          <View style={styles.guideTextCol}>
            <Text style={styles.guideTitle}>Demo contest mode</Text>
            <Text style={styles.guideSub}>
              Credits, rewards and wallet actions are non-withdrawable.
            </Text>
          </View>
          <View style={styles.pdfBadge}>
            <Text style={styles.pdfBadgeText}>DEMO</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              activeOpacity={0.7}
              onPress={() => router.push(item.route)}
            >
              <View
                style={[
                  styles.menuIconCircle,
                  { backgroundColor: item.bgColor },
                ]}
              >
                <Ionicons
                  name={item.icon}
                  size={18}
                  color={item.iconColor}
                />
              </View>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
            </TouchableOpacity>
          ))}

          {/* Log Out Button */}
          <TouchableOpacity
            style={styles.logoutBtn}
            activeOpacity={0.7}
            onPress={handleLogout}
          >
            <View style={styles.logoutIconCircle}>
              <Ionicons name="log-out-outline" size={18} color="#EF4444" />
            </View>
            <Text style={styles.logoutText}>Log Out</Text>
            <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
          </TouchableOpacity>
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

  /* Profile Header */
  profileHeaderCard: {
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
  profileMainRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarWrapper: {
    position: "relative",
    marginRight: 14,
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#0A2F24",
    borderWidth: 2,
    borderColor: "#00C987",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
  },
  verifiedCheckBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#00C987",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#060D1E",
  },
  profileDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18.5,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: -0.2,
  },
  userPhone: {
    fontSize: 11,
    fontWeight: "600",
    color: "#94A3B8",
    marginTop: 2,
  },
  badgesRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 6,
  },
  kycBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 201, 135, 0.15)",
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
    gap: 3,
  },
  kycBadgeText: {
    color: "#00C987",
    fontSize: 9.5,
    fontWeight: "800",
  },
  usdtBadgePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(16, 185, 129, 0.2)",
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
    gap: 3,
  },
  usdtIconText: {
    color: "#00C987",
    fontSize: 9.5,
    fontWeight: "900",
  },
  usdtBadgeText: {
    color: "#00C987",
    fontSize: 9.5,
    fontWeight: "800",
  },
  bellButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#1E293B",
    alignItems: "center",
    justifyContent: "center",
  },

  /* 2x2 Stats Grid */
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E8EDF5",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  statCardLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: "#94A3B8",
    letterSpacing: 0.6,
  },
  statCardValue: {
    fontSize: 22,
    fontWeight: "900",
    color: "#0F172A",
    marginVertical: 4,
    letterSpacing: -0.3,
  },
  statCardSub: {
    fontSize: 10,
    fontWeight: "600",
    color: "#64748B",
  },

  /* Current Rank Card */
  rankCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1.5,
    borderColor: "#FDE68A",
    marginBottom: 16,
    shadowColor: "#F59E0B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  rankTopRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  rankTrophyCircle: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: "#FEF3C7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  rankTextContainer: {
    flex: 1,
  },
  rankLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: "#F59E0B",
    letterSpacing: 0.8,
  },
  rankTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: "#0F172A",
    letterSpacing: -0.2,
  },
  rankSubText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748B",
    marginTop: 2,
  },
  xpProgressTrack: {
    height: 6,
    backgroundColor: "#F1F5F9",
    borderRadius: 6,
    overflow: "hidden",
  },
  xpProgressFill: {
    height: "100%",
    backgroundColor: "#F59E0B",
    borderRadius: 6,
  },
  xpFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
  },
  xpCurrent: {
    fontSize: 9.5,
    fontWeight: "700",
    color: "#94A3B8",
  },
  xpToGo: {
    fontSize: 9.5,
    fontWeight: "800",
    color: "#EA580C",
  },

  /* PDF Guide Banner */
  guideCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#060D1E",
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
    shadowColor: "#060D1E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  guideIconCircle: {
    marginRight: 12,
  },
  guideTextCol: {
    flex: 1,
  },
  guideTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: -0.2,
  },
  guideSub: {
    fontSize: 10.5,
    fontWeight: "600",
    color: "#94A3B8",
    marginTop: 2,
  },
  pdfBadge: {
    backgroundColor: "rgba(0, 201, 135, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  pdfBadgeText: {
    color: "#00C987",
    fontSize: 9.5,
    fontWeight: "900",
  },

  /* Menu Items */
  menuContainer: {
    gap: 10,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#E8EDF5",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  menuIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  menuTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#FEE2E2",
    marginTop: 4,
  },
  logoutIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  logoutText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "800",
    color: "#EF4444",
  },
});
