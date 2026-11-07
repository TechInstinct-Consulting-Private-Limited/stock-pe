import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { colors, radii, spacing, typography } from "../../../theme";
import AppHeader from "../../../components/ui/AppHeader";
import EventFeedCard from "../components/EventFeedCard";
import { DASHBOARD_TABS, fetchDashboard, toFeedCard } from "../services/dashboardService";
import { usePullToRefresh } from "../../../hooks/usePullToRefresh";

export default function ExploreEventsScreen() {
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [contests, setContests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [clock, setClock] = useState(() => Date.now());
  const isFirstLoad = useRef(true);

  const load = useCallback(async ({ showLoading = true } = {}) => {
    if (showLoading) setIsLoading(true);
    try {
      const response = await fetchDashboard(selectedStatus);
      setContests(Array.isArray(response?.contests) ? response.contests : []);
      setError("");
    } catch (_error) {
      setError("Prediction markets are unavailable. Please try again.");
    } finally {
      if (showLoading) setIsLoading(false);
    }
  }, [selectedStatus]);

  useFocusEffect(useCallback(() => {
    const showLoading = isFirstLoad.current;
    isFirstLoad.current = false;
    void load({ showLoading });
    const timer = setInterval(() => void load({ showLoading: false }), 30_000);
    return () => clearInterval(timer);
  }, [load]));
  useEffect(() => {
    const timer = setInterval(() => setClock(Date.now()), 1_000);
    return () => clearInterval(timer);
  }, []);

  const { refreshing, onRefresh } = usePullToRefresh(() => load({ showLoading: false }));
  const events = useMemo(() => contests.map((contest) => toFeedCard(contest, clock)), [clock, contests]);
  const filteredEvents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return events;
    return events.filter((item) => [item.title, item.question, item.instrumentCode, item.instrumentName]
      .some((value) => String(value || "").toLowerCase().includes(query)));
  }, [events, searchQuery]);

  return (
    <View style={styles.container}>
      <AppHeader title="Explore Markets" rightActions={<TouchableOpacity style={styles.positionsBtn} onPress={() => router.push("/(tabs)/contests")} activeOpacity={0.7}><Ionicons name="briefcase-outline" size={18} color={colors.textPrimary} /></TouchableOpacity>} />
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color={colors.textLight} />
          <TextInput style={styles.searchInput} placeholder="Search available contests or indices" placeholderTextColor={colors.textLight} value={searchQuery} onChangeText={setSearchQuery} clearButtonMode="while-editing" />
          {searchQuery.length > 0 && <TouchableOpacity onPress={() => setSearchQuery("")}><Ionicons name="close-circle" size={16} color={colors.textLight} /></TouchableOpacity>}
        </View>
      </View>
      <View style={styles.categoriesSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesScroll}>
          {DASHBOARD_TABS.map((tab) => {
            const selected = selectedStatus === tab.id;
            return <TouchableOpacity key={tab.id} style={[styles.categoryChip, selected && styles.categoryChipActive]} onPress={() => setSelectedStatus(tab.id)} activeOpacity={0.7}><Text style={[styles.categoryChipText, selected && styles.categoryChipTextActive]}>{tab.label}</Text></TouchableOpacity>;
          })}
        </ScrollView>
      </View>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />} showsVerticalScrollIndicator={false}>
        {isLoading ? <View style={styles.stateBox}><ActivityIndicator size="large" color={colors.primary} /><Text style={styles.stateText}>Loading available prediction markets…</Text></View>
          : error ? <View style={styles.stateBox}><Ionicons name="cloud-offline-outline" size={34} color="#EF4444" /><Text style={styles.errorText}>{error}</Text><TouchableOpacity style={styles.retryButton} onPress={() => void load()}><Text style={styles.retryText}>Try again</Text></TouchableOpacity></View>
            : <><View style={styles.countRow}><Text style={styles.countText}>{filteredEvents.length} available prediction market{filteredEvents.length === 1 ? "" : "s"}</Text></View><View style={styles.list}>{filteredEvents.map((item) => <EventFeedCard key={item.id} item={item} />)}</View>{filteredEvents.length === 0 && <View style={styles.stateBox}><Ionicons name="search-outline" size={34} color={colors.textLight} /><Text style={styles.emptyTitle}>No matching contests</Text><Text style={styles.stateText}>Try another status, search term, or pull down to refresh.</Text></View>}</>}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  positionsBtn: { width: 38, height: 38, borderRadius: radii.md, backgroundColor: colors.background, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.borderMedium },
  searchSection: { paddingHorizontal: spacing.base, paddingTop: spacing.md, paddingBottom: spacing.sm, backgroundColor: colors.surface },
  searchBar: { flexDirection: "row", alignItems: "center", backgroundColor: colors.divider, borderRadius: radii.lg, paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 1, gap: spacing.sm },
  searchInput: { flex: 1, fontSize: typography.base, fontWeight: typography.semibold, color: colors.textPrimary, padding: 0 },
  categoriesSection: { backgroundColor: colors.surface, paddingBottom: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  categoriesScroll: { paddingHorizontal: spacing.base, gap: spacing.sm },
  categoryChip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm - 1, borderRadius: radii.md, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.borderMedium },
  categoryChipActive: { backgroundColor: colors.textPrimary, borderColor: colors.textPrimary },
  categoryChipText: { fontSize: typography.sm + 1, fontWeight: typography.bold, color: colors.textMuted },
  categoryChipTextActive: { color: colors.textWhite, fontWeight: typography.black },
  scrollView: { flex: 1 },
  scrollContent: { padding: spacing.base, paddingBottom: spacing.xxl },
  countRow: { marginBottom: spacing.md },
  countText: { fontSize: typography.sm, fontWeight: typography.black, color: colors.textLight, letterSpacing: typography.wide },
  list: { gap: spacing.xs },
  stateBox: { alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 64, paddingHorizontal: 28 },
  stateText: { color: colors.textMuted, fontSize: 12, fontWeight: "600", textAlign: "center", lineHeight: 18 },
  emptyTitle: { color: colors.textPrimary, fontSize: 16, fontWeight: "900" },
  errorText: { color: "#DC2626", fontSize: 13, fontWeight: "700", textAlign: "center" },
  retryButton: { backgroundColor: colors.primary, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10 },
  retryText: { color: "#FFFFFF", fontSize: 12, fontWeight: "900" },
});
