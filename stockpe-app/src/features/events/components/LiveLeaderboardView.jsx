import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getContestLeaderboard, getUserFacingError } from "../../../services/api";
import { shadows } from "../../../theme";

function formatNumber(value) {
  const number = Number(value);
  return Number.isFinite(number)
    ? number.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : "—";
}

function formatReward(entry, currency) {
  const reward = Number(entry?.rewardAmount || 0);
  if (reward <= 0) return "—";
  return `${formatNumber(reward)} ${currency === "DEMO_USDT" ? "Demo USDT" : "Credits"}`;
}

function initials(name) {
  return String(name || "Player").split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

export default function LiveLeaderboardView({ event }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadLeaderboard = useCallback(async (isRefresh = false) => {
    if (!event?.id) return;
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const result = await getContestLeaderboard(event.id);
      setData(result);
      setError("");
    } catch (caught) {
      setError(getUserFacingError(caught, "Could not load contest rankings right now."));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [event?.id]);

  useEffect(() => {
    loadLeaderboard();
    const timer = setInterval(() => loadLeaderboard(true), 15_000);
    return () => clearInterval(timer);
  }, [loadLeaderboard]);

  const contest = data?.contest;
  const entries = data?.entries || [];
  const podium = [1, 2, 3].map((rank) => entries.find((entry) => entry.rank === rank)).filter(Boolean);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>CONTEST BOARD</Text>
            <Text style={styles.headerSub}>{contest?.rankingMode === "FINAL" ? "Final rankings" : "Live provisional rankings"}</Text>
          </View>
          <TouchableOpacity style={styles.refreshButton} onPress={() => loadLeaderboard(true)} disabled={refreshing} activeOpacity={0.72}>
            {refreshing ? <ActivityIndicator size="small" color="#00A870" /> : <Ionicons name="refresh" size={16} color="#00A870" />}
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.state}><ActivityIndicator color="#00C987" /><Text style={styles.stateText}>Loading contest board…</Text></View>
        ) : error ? (
          <View style={styles.state}>
            <Ionicons name="cloud-offline-outline" size={25} color="#EF4444" />
            <Text style={styles.stateText}>{error}</Text>
            <TouchableOpacity onPress={() => loadLeaderboard()}><Text style={styles.retryText}>TRY AGAIN</Text></TouchableOpacity>
          </View>
        ) : entries.length === 0 ? (
          <View style={styles.state}>
            <Ionicons name="podium-outline" size={28} color="#94A3B8" />
            <Text style={styles.emptyTitle}>No predictions yet</Text>
            <Text style={styles.stateText}>Rankings will appear when users submit predictions for this contest.</Text>
          </View>
        ) : (
          <>
            {podium.length > 0 && (
              <View style={styles.podiumRow}>
                {[2, 1, 3].map((rank) => {
                  const entry = podium.find((item) => item.rank === rank);
                  if (!entry) return <View key={rank} style={styles.podiumSpacer} />;
                  const medalStyle = rank === 1 ? styles.gold : rank === 2 ? styles.silver : styles.bronze;
                  return (
                    <View key={entry.id} style={[styles.podiumCard, medalStyle]}>
                      <Ionicons name="trophy-outline" size={17} color={rank === 1 ? "#F59E0B" : rank === 2 ? "#64748B" : "#D97706"} />
                      <Text style={styles.podiumRank}>{rank}{rank === 1 ? "st" : rank === 2 ? "nd" : "rd"}</Text>
                      <Text numberOfLines={1} style={styles.podiumName}>{entry.name}</Text>
                      <Text style={styles.podiumReward}>{formatReward(entry, contest?.currency)}</Text>
                    </View>
                  );
                })}
              </View>
            )}

            <View style={styles.list}>
              {entries.map((entry, index) => (
                <View key={entry.id} style={[styles.row, index !== entries.length - 1 && styles.rowBorder]}>
                  <View style={styles.leftCol}>
                    <View style={[styles.rankBadge, entry.rank <= 3 && styles.topRankBadge]}><Text style={styles.rankText}>{entry.rank}</Text></View>
                    <View style={styles.avatarCircle}><Text style={styles.avatarText}>{initials(entry.name)}</Text></View>
                    <View style={styles.playerText}>
                      <Text numberOfLines={1} style={styles.playerName}>{entry.name}{entry.isCurrentUser ? " (You)" : ""}</Text>
                      <Text style={styles.playerPrediction}>Prediction {formatNumber(entry.prediction)}</Text>
                    </View>
                  </View>
                  <View style={styles.rightCol}>
                    <Text style={styles.accuracyText}>{entry.accuracy === null ? "—" : `${entry.accuracy.toFixed(2)}%`}</Text>
                    <Text style={styles.rewardText}>{formatReward(entry, contest?.currency)}</Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingTop: 12 },
  card: { backgroundColor: "#FFFFFF", borderRadius: 20, padding: 18, borderWidth: 1, borderColor: "#EEF2F6", marginBottom: 20, ...shadows.sm },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
  headerTitle: { fontSize: 11, fontWeight: "900", color: "#071329", letterSpacing: 0.6 },
  headerSub: { fontSize: 11, fontWeight: "700", color: "#00A870", marginTop: 3 },
  refreshButton: { width: 34, height: 34, borderRadius: 17, backgroundColor: "#ECFDF5", alignItems: "center", justifyContent: "center" },
  state: { alignItems: "center", paddingVertical: 28, gap: 8 },
  stateText: { maxWidth: 240, fontSize: 12, color: "#64748B", fontWeight: "600", textAlign: "center", lineHeight: 18 },
  emptyTitle: { fontSize: 14, fontWeight: "800", color: "#071329", marginTop: 2 },
  retryText: { fontSize: 11, fontWeight: "900", color: "#00A870", marginTop: 4 },
  podiumRow: { flexDirection: "row", gap: 8, alignItems: "flex-end", marginBottom: 16 },
  podiumCard: { flex: 1, minHeight: 100, alignItems: "center", justifyContent: "center", paddingHorizontal: 5, paddingVertical: 10, borderRadius: 15, borderWidth: 1 },
  podiumSpacer: { flex: 1 },
  gold: { minHeight: 112, backgroundColor: "#FFFBEB", borderColor: "#FCD34D" },
  silver: { backgroundColor: "#F8FAFC", borderColor: "#CBD5E1" },
  bronze: { backgroundColor: "#FFF7ED", borderColor: "#FDBA74" },
  podiumRank: { fontSize: 16, fontWeight: "900", color: "#071329", marginTop: 2 },
  podiumName: { maxWidth: "100%", fontSize: 10, fontWeight: "800", color: "#334155", marginTop: 4 },
  podiumReward: { fontSize: 8.5, fontWeight: "800", color: "#00A870", marginTop: 2, textAlign: "center" },
  list: { borderTopWidth: 1, borderTopColor: "#F1F5F9" },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 12 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: "#F1F5F9" },
  leftCol: { flex: 1, minWidth: 0, flexDirection: "row", alignItems: "center", gap: 8 },
  rankBadge: { width: 26, height: 26, borderRadius: 8, backgroundColor: "#F1F5F9", alignItems: "center", justifyContent: "center" },
  topRankBadge: { backgroundColor: "#FEF3C7" },
  rankText: { fontSize: 11, fontWeight: "900", color: "#475569" },
  avatarCircle: { width: 30, height: 30, borderRadius: 15, backgroundColor: "#E6FBF3", alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 10, fontWeight: "900", color: "#00966A" },
  playerText: { flex: 1, minWidth: 0 },
  playerName: { fontSize: 12.5, fontWeight: "800", color: "#071329" },
  playerPrediction: { fontSize: 10, fontWeight: "600", color: "#94A3B8", marginTop: 2 },
  rightCol: { maxWidth: 90, alignItems: "flex-end", marginLeft: 8 },
  accuracyText: { fontSize: 12, fontWeight: "900", color: "#00A870" },
  rewardText: { fontSize: 9, fontWeight: "700", color: "#64748B", textAlign: "right", marginTop: 2 },
});
