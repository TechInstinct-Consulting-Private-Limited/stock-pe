import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function WinningsSummaryCard({ winningsData }) {
  return <View style={styles.card}>
    <Text style={styles.label}>TOTAL DEMO REWARDS</Text>
    <Text style={styles.total}>{winningsData.totalRewardCredits} credits</Text>
    <View style={styles.divider} />
    <View style={styles.row}><Ionicons name="trophy-outline" size={17} color="#F59E0B" /><Text style={styles.sub}>{winningsData.winCount} contest win{winningsData.winCount === 1 ? "" : "s"}</Text></View>
    <Text style={styles.note}>Demo credits are non-withdrawable and have no cash or USDT value.</Text>
  </View>;
}

const styles = StyleSheet.create({ card: { backgroundColor: "#0F172A", borderRadius: 20, padding: 20, marginBottom: 16 }, label: { fontSize: 10, fontWeight: "800", color: "#94A3B8", letterSpacing: .6 }, total: { fontSize: 26, fontWeight: "900", color: "#00C987", marginTop: 3 }, divider: { height: 1, backgroundColor: "#1E293B", marginVertical: 14 }, row: { flexDirection: "row", alignItems: "center", gap: 7 }, sub: { color: "#FFFFFF", fontSize: 13, fontWeight: "800" }, note: { color: "#94A3B8", fontSize: 11, lineHeight: 16, marginTop: 10 } });
