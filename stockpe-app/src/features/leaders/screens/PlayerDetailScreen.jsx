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
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { usePlayerDetail } from "../hooks/usePlayerDetail";
import PlayerHeaderCard from "../components/PlayerHeaderCard";
import PlayerTrophyCard from "../components/PlayerTrophyCard";
import HeadToHeadComparisonCard from "../components/HeadToHeadComparisonCard";
import PlayerPastMatchesCard from "../components/PlayerPastMatchesCard";

export default function PlayerDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { player, currentUser, isLoading } = usePlayerDetail(id);

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
          <Text style={styles.headerTitle}>Competitor Profile</Text>
          <View style={{ width: 34 }} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {isLoading || !player ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color="#00C987" />
            </View>
          ) : (
            <>
              {/* 1. Header Card (Avatar, Tier, 4 Stats) */}
              <PlayerHeaderCard player={player} />

              {/* 2. Trophy Shelf */}
              <PlayerTrophyCard trophies={player.trophies} />

              {/* 3. Head to Head Analytics vs Current User */}
              <HeadToHeadComparisonCard
                player={player}
                currentUser={currentUser}
              />

              {/* 4. Past Completed Contests & Winning Picks */}
              <PlayerPastMatchesCard pastPicks={player.pastPicks} />
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
});
