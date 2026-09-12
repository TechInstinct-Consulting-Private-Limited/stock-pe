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
import { useUserPredictions } from "../hooks/useUserPredictions";
import PredictionItemCard from "../components/PredictionItemCard";

export default function MyPredictionsScreen() {
  const router = useRouter();
  const { activeTab, setActiveTab, predictions, isLoading, stats } =
    useUserPredictions();

  const tabs = [
    { id: "ALL", label: "All Events" },
    { id: "LIVE", label: `Live (${stats.activeCount})` },
    { id: "SETTLED", label: "Settled" },
  ];

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
          <Text style={styles.headerTitle}>My Predictions</Text>
          <View style={{ width: 34 }} />
        </View>

        {/* Top Performance Stats Grid */}
        <View style={styles.statsBanner}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>TOTAL INVESTED</Text>
            <Text style={styles.statVal}>₹{stats.totalInvested}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>LIVE PROFIT</Text>
            <Text style={[styles.statVal, { color: "#00C987" }]}>
              +₹{stats.liveProfits}
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>WIN ACCURACY</Text>
            <Text style={[styles.statVal, { color: "#F59E0B" }]}>
              {stats.winRate}%
            </Text>
          </View>
        </View>

        {/* Tab Filter Bar */}
        <View style={styles.tabBar}>
          {tabs.map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                onPress={() => setActiveTab(tab.id)}
                style={[
                  styles.tabItem,
                  isSelected && styles.tabItemSelected,
                ]}
                activeOpacity={0.75}
              >
                <Text
                  style={[
                    styles.tabItemText,
                    isSelected && styles.tabItemTextSelected,
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Predictions List */}
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {isLoading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color="#00C987" />
            </View>
          ) : predictions.length === 0 ? (
            <View style={styles.emptyBox}>
              <Ionicons name="stats-chart-outline" size={48} color="#CBD5E1" />
              <Text style={styles.emptyTitle}>No Predictions Found</Text>
              <Text style={styles.emptySub}>
                Join open opinion markets and trade YES/NO contracts to see your active positions here.
              </Text>
            </View>
          ) : (
            predictions.map((p) => (
              <PredictionItemCard key={p.id} prediction={p} />
            ))
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
  statsBanner: {
    flexDirection: "row",
    backgroundColor: "#0F172A",
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "space-around",
  },
  statBox: {
    alignItems: "center",
    flex: 1,
  },
  statLabel: {
    fontSize: 9.5,
    fontWeight: "800",
    color: "#94A3B8",
    letterSpacing: 0.5,
  },
  statVal: {
    fontSize: 16,
    fontWeight: "900",
    color: "#FFFFFF",
    marginTop: 3,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: "#1E293B",
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#F1F5F9",
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    padding: 4,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 10,
  },
  tabItemSelected: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  tabItemText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#64748B",
  },
  tabItemTextSelected: {
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
  emptyBox: {
    padding: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
    marginTop: 12,
  },
  emptySub: {
    fontSize: 12.5,
    color: "#94A3B8",
    textAlign: "center",
    marginTop: 4,
    lineHeight: 18,
  },
});
