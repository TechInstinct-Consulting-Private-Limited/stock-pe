import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function ReferralStepsCard({ steps }) {
  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>HOW IT WORKS (3 SIMPLE STEPS)</Text>

      {steps.map((item, index) => (
        <View key={item.step} style={styles.stepRow}>
          <View style={styles.stepIndicator}>
            <View style={styles.stepNumberCircle}>
              <Text style={styles.stepNumberText}>{item.step}</Text>
            </View>
            {index < steps.length - 1 && <View style={styles.connectingLine} />}
          </View>

          <View style={styles.stepContent}>
            <View style={styles.titleRow}>
              <Ionicons name={item.icon} size={16} color="#00C987" />
              <Text style={styles.stepTitle}>{item.title}</Text>
            </View>
            <Text style={styles.stepDesc}>{item.desc}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
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
    marginBottom: 16,
  },
  stepRow: {
    flexDirection: "row",
    marginBottom: 14,
  },
  stepIndicator: {
    alignItems: "center",
    marginRight: 14,
  },
  stepNumberCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#E6FBF3",
    borderWidth: 1.5,
    borderColor: "#A7F3D0",
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumberText: {
    fontSize: 12,
    fontWeight: "900",
    color: "#00C987",
  },
  connectingLine: {
    width: 2,
    flex: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 4,
  },
  stepContent: {
    flex: 1,
    paddingBottom: 6,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  stepTitle: {
    fontSize: 13.5,
    fontWeight: "800",
    color: "#0F172A",
  },
  stepDesc: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
    lineHeight: 16,
  },
});
