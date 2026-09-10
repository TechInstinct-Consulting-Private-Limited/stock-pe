import React from "react";
import { StyleSheet, View } from "react-native";
import { colors, radii, shadows, spacing } from "../../theme";

export default function AppCard({
  children,
  variant = "surface", // "surface" | "dark" | "outline" | "highlight"
  style,
  topHighlightColor,
}) {
  const getCardStyle = () => {
    switch (variant) {
      case "dark":
        return styles.darkCard;
      case "outline":
        return styles.outlineCard;
      case "surface":
      default:
        return styles.surfaceCard;
    }
  };

  return (
    <View
      style={[
        styles.baseCard,
        getCardStyle(),
        topHighlightColor && {
          borderTopColor: topHighlightColor,
          borderTopWidth: 3,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  baseCard: {
    borderRadius: radii.xl,
    padding: spacing.base,
  },
  surfaceCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.sm,
  },
  darkCard: {
    backgroundColor: colors.surfaceDark,
    borderWidth: 1,
    borderColor: colors.borderDark,
    ...shadows.darkHero,
  },
  outlineCard: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.borderMedium,
  },
});
