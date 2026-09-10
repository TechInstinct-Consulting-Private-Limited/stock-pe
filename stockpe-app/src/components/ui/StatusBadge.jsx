import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, radii, spacing, typography } from "../../theme";

export default function StatusBadge({ status, style, textStyle }) {
  const getBadgeColors = () => {
    const s = String(status || "").toUpperCase();
    if (s.includes("LIVE")) {
      return { bg: colors.dangerBg, text: colors.dangerText };
    }
    if (s === "OPEN" || s === "ACTIVE" || s === "WON") {
      return { bg: colors.primaryLight, text: colors.primaryHover };
    }
    if (s === "SOON" || s === "PENDING") {
      return { bg: colors.amberLight, text: colors.warning };
    }
    if (s === "YES") {
      return { bg: colors.successBg, text: colors.successText };
    }
    if (s === "NO") {
      return { bg: colors.dangerBg, text: colors.dangerText };
    }
    return { bg: colors.borderLight, text: colors.textMuted };
  };

  const { bg, text } = getBadgeColors();

  return (
    <View style={[styles.badge, { backgroundColor: bg }, style]}>
      <Text style={[styles.badgeText, { color: text }, textStyle]}>
        {status}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2.5,
    borderRadius: radii.sm,
    alignSelf: "flex-start",
  },
  badgeText: {
    fontSize: typography.xs,
    fontWeight: typography.black,
    letterSpacing: typography.wide,
  },
});
