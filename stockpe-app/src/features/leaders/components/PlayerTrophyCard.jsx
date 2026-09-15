import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function PlayerTrophyCard({ trophies }) {
  if (!trophies || trophies.length === 0) return null;

  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>TROPHY SHELF & ACHIEVEMENTS</Text>

      <View style={styles.trophyGrid}>
        {trophies.map((trophy) => (
          <View key={trophy.id} style={styles.trophyItem}>
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: trophy.bg || "#FEF3C7" },
              ]}
            >
              <Ionicons
                name={trophy.icon}
                size={22}
                color={trophy.color || "#F59E0B"}
              />
            </View>
            <Text style={styles.trophyTitle} numberOfLines={1}>
              {trophy.title}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#EDF2F7",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: "#64748B",
    letterSpacing: 0.8,
    marginBottom: 14,
  },
  trophyGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  trophyItem: {
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    gap: 10,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  trophyTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#0F172A",
    flex: 1,
  },
});
