import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors, radii, shadows, spacing, typography } from "../../theme";

export default function TabPills({
  tabs = [],
  activeTab,
  onTabChange,
  style,
  pillStyle,
}) {
  return (
    <View style={[styles.container, style]}>
      {tabs.map((tab) => {
        const key = typeof tab === "string" ? tab : tab.id;
        const label = typeof tab === "string" ? tab : tab.label;
        const count = typeof tab === "object" ? tab.count : undefined;
        const isActive = activeTab === key;

        return (
          <TouchableOpacity
            key={key}
            style={[
              styles.pill,
              isActive && styles.pillActive,
              pillStyle,
            ]}
            onPress={() => onTabChange(key)}
            activeOpacity={0.75}
          >
            <Text
              style={[
                styles.pillText,
                isActive && styles.pillTextActive,
              ]}
            >
              {label} {count !== undefined ? `(${count})` : ""}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.xs,
    borderWidth: 1,
    borderColor: colors.borderMedium,
    ...shadows.sm,
  },
  pill: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.md,
  },
  pillActive: {
    backgroundColor: colors.primary,
  },
  pillText: {
    fontSize: typography.base - 1,
    fontWeight: typography.black,
    color: colors.textMuted,
    letterSpacing: typography.wide,
  },
  pillTextActive: {
    color: colors.textWhite,
  },
});
