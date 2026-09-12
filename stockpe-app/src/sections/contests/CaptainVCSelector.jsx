import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors, radii, spacing, typography } from "../../theme";
import AppCard from "../../components/ui/AppCard";

export default function CaptainVCSelector({
  selectedStocks = [],
  captain,
  viceCaptain,
  onSelectCaptain,
  onSelectViceCaptain,
}) {
  return (
    <View style={styles.container}>
      {/* Tip Banner */}
      <View style={styles.tipBanner}>
        <Text style={styles.tipTitle}>Choose Multipliers</Text>
        <Text style={styles.tipSubtitle}>
          <Text style={{ color: colors.warning, fontWeight: typography.black }}>C (Captain)</Text> gets 2x Points •{" "}
          <Text style={{ color: colors.cyan, fontWeight: typography.black }}>VC (Vice-Captain)</Text> gets 1.5x Points
        </Text>
      </View>

      {/* Stocks Multiplier Rows */}
      {selectedStocks.map((stock) => {
        const isC = captain === stock.symbol;
        const isVC = viceCaptain === stock.symbol;
        const isLong = stock.type === "LONG";

        return (
          <AppCard key={stock.symbol} style={styles.stockCard}>
            <View style={styles.stockInfo}>
              <View style={styles.symbolRow}>
                <Text style={styles.symbol}>{stock.symbol}</Text>
                <View
                  style={[
                    styles.typeTag,
                    { backgroundColor: isLong ? colors.primaryLight : colors.dangerBg },
                  ]}
                >
                  <Text
                    style={[
                      styles.typeTagText,
                      { color: isLong ? colors.primary : colors.danger },
                    ]}
                  >
                    {isLong ? "LONG 🚀" : "SHORT 🔻"}
                  </Text>
                </View>
              </View>
              <Text style={styles.subText}>
                {stock.sector} • {stock.credits} Cr • ₹{stock.price}
              </Text>
            </View>

            {/* C / VC Buttons */}
            <View style={styles.multiplierButtons}>
              {/* Captain Button */}
              <TouchableOpacity
                style={[styles.multBtn, isC && styles.multBtnCActive]}
                onPress={() => onSelectCaptain(stock.symbol)}
                activeOpacity={0.8}
              >
                <Text style={[styles.multBtnText, isC && styles.multBtnTextActive]}>
                  2x C
                </Text>
              </TouchableOpacity>

              {/* Vice Captain Button */}
              <TouchableOpacity
                style={[styles.multBtn, isVC && styles.multBtnVCActive]}
                onPress={() => onSelectViceCaptain(stock.symbol)}
                activeOpacity={0.8}
              >
                <Text style={[styles.multBtnText, isVC && styles.multBtnTextActive]}>
                  1.5x VC
                </Text>
              </TouchableOpacity>
            </View>
          </AppCard>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  tipBanner: {
    backgroundColor: colors.surfaceDark,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.xs,
    borderWidth: 1,
    borderColor: colors.borderDark,
  },
  tipTitle: {
    fontSize: typography.base,
    fontWeight: typography.black,
    color: colors.textWhite,
    marginBottom: 3,
  },
  tipSubtitle: {
    fontSize: typography.xs + 1,
    fontWeight: typography.semibold,
    color: colors.textMuted,
    lineHeight: 17,
  },
  stockCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
  },
  stockInfo: {
    flex: 1,
  },
  symbolRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs + 2,
    marginBottom: 3,
  },
  symbol: {
    fontSize: typography.base,
    fontWeight: typography.black,
    color: colors.textPrimary,
  },
  typeTag: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: radii.xs,
  },
  typeTagText: {
    fontSize: typography.xs - 0.5,
    fontWeight: typography.black,
  },
  subText: {
    fontSize: typography.xs + 0.5,
    fontWeight: typography.semibold,
    color: colors.textMuted,
  },
  multiplierButtons: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  multBtn: {
    width: 48,
    height: 36,
    borderRadius: radii.md,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: colors.borderMedium,
  },
  multBtnCActive: {
    backgroundColor: colors.warning,
    borderColor: colors.warning,
  },
  multBtnVCActive: {
    backgroundColor: colors.cyan,
    borderColor: colors.cyan,
  },
  multBtnText: {
    fontSize: typography.xs + 0.5,
    fontWeight: typography.black,
    color: colors.textSecondary,
  },
  multBtnTextActive: {
    color: colors.textWhite,
  },
});
