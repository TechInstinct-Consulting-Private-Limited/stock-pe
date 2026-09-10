import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { colors, radii, spacing, typography } from "../../theme";

export default function AppHeader({
  title,
  subtitle,
  showBack = true,
  onBack,
  rightActions,
  children,
}) {
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <View style={styles.header}>
      {showBack ? (
        <TouchableOpacity
          style={styles.iconButton}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
      ) : (
        <View style={styles.emptySlot} />
      )}

      <View style={styles.centerContainer}>
        {children ? (
          children
        ) : (
          <>
            {title && <Text style={styles.titleText}>{title}</Text>}
            {subtitle && <Text style={styles.subtitleText}>{subtitle}</Text>}
          </>
        )}
      </View>

      <View style={styles.rightActionsContainer}>
        {rightActions || <View style={styles.emptySlot} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm + 2,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: radii.md,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.borderMedium,
  },
  emptySlot: {
    width: 38,
    height: 38,
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  titleText: {
    fontSize: typography.md,
    fontWeight: typography.black,
    color: colors.textPrimary,
    letterSpacing: typography.tight,
  },
  subtitleText: {
    fontSize: typography.xs,
    fontWeight: typography.bold,
    color: colors.textMuted,
    marginTop: 2,
  },
  rightActionsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs + 2,
  },
});
