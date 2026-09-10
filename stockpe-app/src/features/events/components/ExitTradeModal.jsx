import React from "react";
import { Modal, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radii, shadows, spacing, typography } from "../../../theme";
import PrimaryButton from "../../../components/ui/PrimaryButton";
import { formatINR } from "../../../utils/formatters";

export default function ExitTradeModal({
  visible,
  trade,
  onConfirm,
  onClose,
}) {
  if (!trade) return null;

  const isProfitable = trade.pnl >= 0;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.iconCircle}>
            <Ionicons name="exit-outline" size={32} color={colors.danger} />
          </View>

          <Text style={styles.title}>Exit Position Early?</Text>
          <Text style={styles.subtitle}>
            Sell your {trade.quantity} {trade.option} contracts now at current market rate ₹{trade.currentPrice}/unit.
          </Text>

          <View style={styles.payoutBox}>
            <View style={styles.payoutRow}>
              <Text style={styles.payoutLabel}>You Will Receive:</Text>
              <Text style={styles.payoutVal}>
                {formatINR(trade.currentValue)}
              </Text>
            </View>

            <View style={styles.payoutRow}>
              <Text style={styles.payoutLabel}>Net Profit/Loss:</Text>
              <Text
                style={[
                  styles.payoutVal,
                  { color: isProfitable ? colors.primary : colors.danger },
                ]}
              >
                {isProfitable ? "+" : ""}{formatINR(trade.pnl)}
              </Text>
            </View>
          </View>

          <View style={styles.btnGroup}>
            <PrimaryButton
              title="Confirm Exit"
              variant="danger"
              onPress={onConfirm}
            />
            <PrimaryButton
              title="Keep Position"
              variant="subtle"
              onPress={onClose}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.backdrop,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.xxl,
    padding: spacing.xl,
    width: "100%",
    maxWidth: 360,
    alignItems: "center",
    ...shadows.lg,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: radii.full,
    backgroundColor: colors.dangerBg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.lg,
    fontWeight: typography.black,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.sm + 0.5,
    fontWeight: typography.semibold,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: spacing.base,
  },
  payoutBox: {
    width: "100%",
    backgroundColor: colors.background,
    borderRadius: radii.md,
    padding: spacing.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderMedium,
    marginBottom: spacing.lg,
  },
  payoutRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  payoutLabel: {
    fontSize: typography.sm,
    fontWeight: typography.semibold,
    color: colors.textMuted,
  },
  payoutVal: {
    fontSize: typography.base,
    fontWeight: typography.black,
    color: colors.textPrimary,
  },
  btnGroup: {
    width: "100%",
    gap: spacing.sm,
  },
});
