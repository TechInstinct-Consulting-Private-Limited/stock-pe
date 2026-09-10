import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors, radii, shadows, spacing, typography } from "../../../theme";
import QuantityStepper from "../../../components/ui/QuantityStepper";
import PrimaryButton from "../../../components/ui/PrimaryButton";
import { formatINR } from "../../../utils/formatters";

export default function TradeActionSheet({
  event,
  selectedOption,
  onSelectOption,
  quantity,
  onChangeQuantity,
  metrics,
  walletBalance,
  onPlaceOrder,
  bottomInset = 16,
}) {
  const isYes = selectedOption === "YES";

  return (
    <View
      style={[
        styles.container,
        { paddingBottom: Math.max(bottomInset, spacing.base) },
      ]}
    >
      {/* Option Switcher */}
      <View style={styles.optionRow}>
        <TouchableOpacity
          style={[
            styles.optionBtn,
            styles.optionBtnYes,
            isYes && styles.optionBtnYesActive,
          ]}
          onPress={() => onSelectOption("YES")}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.optionLabel,
              isYes && styles.optionLabelActive,
            ]}
          >
            YES (₹{event?.yesPrice})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.optionBtn,
            styles.optionBtnNo,
            !isYes && styles.optionBtnNoActive,
          ]}
          onPress={() => onSelectOption("NO")}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.optionLabel,
              !isYes && styles.optionLabelActive,
            ]}
          >
            NO (₹{event?.noPrice})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Quantity Stepper */}
      <View style={styles.stepperRow}>
        <QuantityStepper
          value={quantity}
          onChange={onChangeQuantity}
          step={5}
          min={1}
          presets={[10, 50, 100]}
        />
      </View>

      {/* Calculation Bar */}
      <View style={styles.calcBar}>
        <View style={styles.calcCol}>
          <Text style={styles.calcLabel}>You Pay</Text>
          <Text style={styles.calcVal}>{formatINR(metrics.investment)}</Text>
          <Text style={styles.calcSub}>{metrics.investmentUsdt} USDT</Text>
        </View>

        <View style={styles.calcDivider} />

        <View style={styles.calcCol}>
          <Text style={styles.calcLabel}>Potential Win</Text>
          <Text style={[styles.calcVal, { color: colors.primary }]}>
            {formatINR(metrics.potentialPayout)}
          </Text>
          <Text style={[styles.calcSub, { color: colors.primary }]}>
            +{metrics.roiPercentage}% ({metrics.payoutUsdt} USDT)
          </Text>
        </View>

        <View style={styles.calcWalletCol}>
          <Text style={styles.calcLabel}>Wallet</Text>
          <Text style={styles.walletVal}>{formatINR(walletBalance)}</Text>
        </View>
      </View>

      {/* Place Order CTA */}
      <PrimaryButton
        title={`CONFIRM ${selectedOption} • ${formatINR(metrics.investment)}`}
        variant={isYes ? "primary" : "danger"}
        iconName="arrow-forward-circle"
        onPress={onPlaceOrder}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.xxl,
    borderTopRightRadius: radii.xxl,
    paddingHorizontal: spacing.base,
    paddingTop: spacing.md + 2,
    borderWidth: 1,
    borderColor: colors.borderMedium,
    ...shadows.lg,
  },
  optionRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  optionBtn: {
    flex: 1,
    paddingVertical: spacing.sm + 2,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
  },
  optionBtnYes: {
    borderColor: colors.primary,
    backgroundColor: colors.successBg,
  },
  optionBtnYesActive: {
    backgroundColor: colors.primary,
  },
  optionBtnNo: {
    borderColor: colors.danger,
    backgroundColor: colors.dangerBg,
  },
  optionBtnNoActive: {
    backgroundColor: colors.danger,
  },
  optionLabel: {
    fontSize: typography.base,
    fontWeight: typography.black,
    color: colors.textPrimary,
    letterSpacing: typography.wide,
  },
  optionLabelActive: {
    color: colors.textWhite,
  },
  stepperRow: {
    marginBottom: spacing.md,
  },
  calcBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: radii.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  calcCol: {
    flex: 1,
  },
  calcLabel: {
    fontSize: typography.xs,
    fontWeight: typography.black,
    color: colors.textLight,
    letterSpacing: typography.wide,
  },
  calcVal: {
    fontSize: typography.base + 1,
    fontWeight: typography.black,
    color: colors.textPrimary,
  },
  calcSub: {
    fontSize: typography.xs + 0.5,
    fontWeight: typography.bold,
    color: colors.textMuted,
  },
  calcDivider: {
    width: 1,
    height: 28,
    backgroundColor: colors.borderMedium,
    marginHorizontal: spacing.sm,
  },
  calcWalletCol: {
    alignItems: "flex-end",
  },
  walletVal: {
    fontSize: typography.base,
    fontWeight: typography.bold,
    color: colors.textSecondary,
  },
});
