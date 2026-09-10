import React from "react";
import { Modal, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { colors, radii, shadows, spacing, typography } from "../../../theme";
import PrimaryButton from "../../../components/ui/PrimaryButton";
import { formatINR } from "../../../utils/formatters";

export default function OrderSuccessModal({
  visible,
  trade,
  onClose,
}) {
  if (!trade) return null;

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
            <Ionicons name="checkmark" size={36} color={colors.textWhite} />
          </View>

          <Text style={styles.title}>Prediction Placed!</Text>
          <Text style={styles.subtitle}>
            Your order of {trade.quantity} {trade.option} contracts has been successfully placed.
          </Text>

          <View style={styles.summaryBox}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Order ID:</Text>
              <Text style={styles.summaryValue}>{trade.tradeId}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Invested Amount:</Text>
              <Text style={styles.summaryValue}>
                {formatINR(trade.investedAmount)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Potential Payout:</Text>
              <Text style={[styles.summaryValue, { color: colors.primary, fontWeight: typography.black }]}>
                {formatINR(trade.potentialPayout)}
              </Text>
            </View>
          </View>

          <View style={styles.btnGroup}>
            <PrimaryButton
              title="View My Positions"
              onPress={() => {
                onClose();
                router.push("/event/my-trades");
              }}
            />
            <PrimaryButton
              title="Done"
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
    width: 64,
    height: 64,
    borderRadius: radii.full,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.base,
  },
  title: {
    fontSize: typography.xl,
    fontWeight: typography.black,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.sm + 1,
    fontWeight: typography.semibold,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: spacing.lg,
  },
  summaryBox: {
    width: "100%",
    backgroundColor: colors.background,
    borderRadius: radii.lg,
    padding: spacing.md + 2,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderMedium,
    marginBottom: spacing.lg,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: typography.sm,
    fontWeight: typography.semibold,
    color: colors.textMuted,
  },
  summaryValue: {
    fontSize: typography.base - 0.5,
    fontWeight: typography.bold,
    color: colors.textPrimary,
  },
  btnGroup: {
    width: "100%",
    gap: spacing.sm,
  },
});
