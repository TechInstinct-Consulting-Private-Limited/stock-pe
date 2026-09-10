import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radii, spacing, typography } from "../../theme";

export default function StockPickerRow({
  stock,
  isSelected,
  selectedType = "LONG", // "LONG" | "SHORT"
  onToggleSelect,
  onSetType,
}) {
  const isLong = selectedType === "LONG";

  return (
    <View style={[styles.container, isSelected && styles.containerSelected]}>
      {/* Left: Info */}
      <View style={styles.leftSection}>
        <View style={styles.titleRow}>
          <Text style={styles.symbol}>{stock.symbol}</Text>
          <View style={styles.sectorPill}>
            <Text style={styles.sectorText}>{stock.sector}</Text>
          </View>
        </View>

        <Text style={styles.companyName} numberOfLines={1}>
          {stock.name}
        </Text>

        <View style={styles.priceRow}>
          <Text style={styles.price}>₹{stock.price}</Text>
          <Text
            style={[
              styles.change,
              { color: stock.isPositive ? colors.primary : colors.danger },
            ]}
          >
            {stock.isPositive ? "↗ " : "↘ "}
            {stock.change}
          </Text>
        </View>
      </View>

      {/* Middle: Long / Short Toggles (Enabled when selected) */}
      <View style={styles.middleSection}>
        <Text style={styles.creditsTag}>{stock.credits} Cr</Text>

        {isSelected ? (
          <View style={styles.typeToggleGroup}>
            <TouchableOpacity
              style={[
                styles.typeBtn,
                styles.typeBtnLong,
                isLong && styles.typeBtnLongActive,
              ]}
              onPress={() => onSetType(stock.symbol, "LONG")}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.typeBtnText,
                  isLong && styles.typeBtnTextActive,
                ]}
              >
                LONG 🚀
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.typeBtn,
                styles.typeBtnShort,
                !isLong && styles.typeBtnShortActive,
              ]}
              onPress={() => onSetType(stock.symbol, "SHORT")}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.typeBtnText,
                  !isLong && styles.typeBtnTextActive,
                ]}
              >
                SHORT 🔻
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Text style={styles.selectedByText}>{stock.selectedCount} picked</Text>
        )}
      </View>

      {/* Right: Select / Unselect Button */}
      <TouchableOpacity
        style={[styles.selectBtn, isSelected && styles.selectBtnActive]}
        onPress={() => onToggleSelect(stock)}
        activeOpacity={0.8}
      >
        <Ionicons
          name={isSelected ? "checkmark" : "add"}
          size={20}
          color={isSelected ? colors.textWhite : colors.primary}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: spacing.sm,
  },
  containerSelected: {
    borderColor: colors.primary,
    backgroundColor: "#F6FDF9",
  },
  leftSection: {
    flex: 1.2,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs + 2,
    marginBottom: 2,
  },
  symbol: {
    fontSize: typography.base,
    fontWeight: typography.black,
    color: colors.textPrimary,
  },
  sectorPill: {
    backgroundColor: colors.borderLight,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: radii.xs,
  },
  sectorText: {
    fontSize: typography.xs - 0.5,
    fontWeight: typography.bold,
    color: colors.textMuted,
  },
  companyName: {
    fontSize: typography.xs + 1,
    fontWeight: typography.semibold,
    color: colors.textMuted,
    marginBottom: 3,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs + 2,
  },
  price: {
    fontSize: typography.sm,
    fontWeight: typography.bold,
    color: colors.textPrimary,
  },
  change: {
    fontSize: typography.xs + 0.5,
    fontWeight: typography.black,
  },
  middleSection: {
    flex: 1.3,
    alignItems: "center",
    paddingHorizontal: spacing.xs,
  },
  creditsTag: {
    fontSize: typography.sm,
    fontWeight: typography.black,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  selectedByText: {
    fontSize: typography.xs,
    fontWeight: typography.semibold,
    color: colors.textLight,
  },
  typeToggleGroup: {
    flexDirection: "row",
    gap: 4,
  },
  typeBtn: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: radii.xs + 2,
    borderWidth: 1,
  },
  typeBtnLong: {
    borderColor: colors.primary,
    backgroundColor: colors.surface,
  },
  typeBtnLongActive: {
    backgroundColor: colors.primary,
  },
  typeBtnShort: {
    borderColor: colors.danger,
    backgroundColor: colors.surface,
  },
  typeBtnShortActive: {
    backgroundColor: colors.danger,
  },
  typeBtnText: {
    fontSize: typography.xs - 0.5,
    fontWeight: typography.black,
    color: colors.textPrimary,
  },
  typeBtnTextActive: {
    color: colors.textWhite,
  },
  selectBtn: {
    width: 36,
    height: 36,
    borderRadius: radii.md,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(0, 201, 135, 0.3)",
    marginLeft: spacing.xs,
  },
  selectBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
});
