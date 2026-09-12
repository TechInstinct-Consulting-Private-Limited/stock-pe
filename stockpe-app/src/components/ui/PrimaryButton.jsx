import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radii, shadows, spacing, typography } from "../../theme";

export default function PrimaryButton({
  title,
  onPress,
  variant = "primary", // "primary" | "danger" | "outline" | "subtle"
  iconName,
  iconPosition = "right",
  disabled = false,
  style,
  textStyle,
}) {
  const getVariantStyles = () => {
    switch (variant) {
      case "danger":
        return {
          btn: styles.dangerBtn,
          text: styles.whiteText,
          iconColor: colors.textWhite,
        };
      case "outline":
        return {
          btn: styles.outlineBtn,
          text: styles.outlineText,
          iconColor: colors.primary,
        };
      case "subtle":
        return {
          btn: styles.subtleBtn,
          text: styles.subtleText,
          iconColor: colors.textSecondary,
        };
      case "primary":
      default:
        return {
          btn: styles.primaryBtn,
          text: styles.whiteText,
          iconColor: colors.textWhite,
        };
    }
  };

  const { btn, text, iconColor } = getVariantStyles();

  return (
    <TouchableOpacity
      style={[
        styles.baseButton,
        btn,
        disabled && styles.disabledBtn,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.85}
    >
      {iconName && iconPosition === "left" && (
        <Ionicons name={iconName} size={18} color={iconColor} style={{ marginRight: 6 }} />
      )}
      <Text style={[styles.baseText, text, textStyle]}>{title}</Text>
      {iconName && iconPosition === "right" && (
        <Ionicons name={iconName} size={18} color={iconColor} style={{ marginLeft: 6 }} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  baseButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.lg,
  },
  baseText: {
    fontSize: typography.base + 1,
    fontWeight: typography.black,
    letterSpacing: typography.wide,
  },
  primaryBtn: {
    backgroundColor: colors.primary,
    ...shadows.md,
    shadowColor: colors.primary,
  },
  dangerBtn: {
    backgroundColor: colors.danger,
    ...shadows.md,
    shadowColor: colors.danger,
  },
  outlineBtn: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  subtleBtn: {
    backgroundColor: colors.borderLight,
  },
  whiteText: {
    color: colors.textWhite,
  },
  outlineText: {
    color: colors.primary,
  },
  subtleText: {
    color: colors.textSecondary,
  },
  disabledBtn: {
    opacity: 0.5,
  },
});
