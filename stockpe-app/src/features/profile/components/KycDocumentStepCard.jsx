import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function KycDocumentStepCard({
  title,
  subtitle,
  icon,
  status, // "VERIFIED" | "PENDING" | "REQUIRED"
  maskedDetail,
  onPress,
}) {
  const isVerified = status === "VERIFIED";

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        styles.card,
        isVerified && styles.cardVerified,
      ]}
    >
      <View
        style={[
          styles.iconCircle,
          { backgroundColor: isVerified ? "#E6FBF3" : "#FEF3C7" },
        ]}
      >
        <Ionicons
          name={isVerified ? "checkmark-circle" : icon}
          size={22}
          color={isVerified ? "#00C987" : "#D97706"}
        />
      </View>

      <View style={styles.textContainer}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{title}</Text>
          <View
            style={[
              styles.badge,
              { backgroundColor: isVerified ? "#E6FBF3" : "#FEF3C7" },
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                { color: isVerified ? "#00C987" : "#D97706" },
              ]}
            >
              {status}
            </Text>
          </View>
        </View>

        <Text style={styles.detailText}>
          {maskedDetail || subtitle}
        </Text>
      </View>

      <Ionicons
        name={isVerified ? "chevron-forward" : "arrow-forward-circle"}
        size={20}
        color={isVerified ? "#CBD5E1" : "#00C987"}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: "#EDF2F7",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardVerified: {
    borderColor: "#A7F3D0",
    backgroundColor: "#FAFFFD",
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  textContainer: {
    flex: 1,
    marginRight: 8,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.4,
  },
  detailText: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "600",
    marginTop: 3,
  },
});
