import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radii, spacing, typography } from "../../../theme";
import AppCard from "../../../components/ui/AppCard";

export default function ResolutionRules({ event }) {
  return (
    <AppCard style={styles.card}>
      {/* Verified Source Banner */}
      <View style={styles.sourceBox}>
        <Ionicons name="shield-checkmark" size={18} color={colors.primary} />
        <View style={{ flex: 1 }}>
          <Text style={styles.sourceTitle}>Verified Settlement Source</Text>
          <Text style={styles.sourceDesc}>{event?.settlementSource}</Text>
        </View>
      </View>

      {/* Rules List */}
      <Text style={styles.rulesHeading}>Market Resolution Rules:</Text>
      {event?.rules?.map((rule, idx) => (
        <View key={idx} style={styles.ruleItem}>
          <Text style={styles.ruleBullet}>•</Text>
          <Text style={styles.ruleText}>{rule}</Text>
        </View>
      ))}
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  sourceBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.primaryLight,
    padding: spacing.md,
    borderRadius: radii.md,
    marginBottom: spacing.base,
  },
  sourceTitle: {
    fontSize: typography.sm,
    fontWeight: typography.black,
    color: colors.successText,
  },
  sourceDesc: {
    fontSize: typography.sm,
    fontWeight: typography.semibold,
    color: colors.textSecondary,
    marginTop: 2,
  },
  rulesHeading: {
    fontSize: typography.base - 1,
    fontWeight: typography.black,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  ruleItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    marginBottom: spacing.xs + 2,
  },
  ruleBullet: {
    fontSize: typography.base,
    color: colors.primary,
    fontWeight: typography.black,
    lineHeight: 18,
  },
  ruleText: {
    flex: 1,
    fontSize: typography.sm + 0.5,
    fontWeight: typography.semibold,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});
