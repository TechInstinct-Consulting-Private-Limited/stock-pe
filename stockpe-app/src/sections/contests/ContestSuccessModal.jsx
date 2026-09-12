import React from "react";
import { Modal, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { colors, radii, shadows, spacing, typography } from "../../theme";
import PrimaryButton from "../../components/ui/PrimaryButton";

export default function ContestSuccessModal({
  visible,
  entry,
  onClose,
}) {
  if (!entry) return null;

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
            <Ionicons name="trophy" size={36} color={colors.textWhite} />
          </View>

          <Text style={styles.title}>Arena Joined!</Text>
          <Text style={styles.subtitle}>
            Your squad "{entry.teamName}" is locked in for {entry.contestTitle}.
          </Text>

          <View style={styles.summaryBox}>
            <View style={styles.row}>
              <Text style={styles.label}>Entry ID:</Text>
              <Text style={styles.val}>{entry.joinId}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Entry Fee Paid:</Text>
              <Text style={styles.val}>{entry.entryFee}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Starting Rank:</Text>
              <Text style={[styles.val, { color: colors.primary }]}>
                #{entry.rank} / {entry.totalTeams}
              </Text>
            </View>
          </View>

          <View style={styles.btnGroup}>
            <PrimaryButton
              title="Track Live Arena"
              onPress={() => {
                onClose();
                router.push(`/contest/${entry.contestId}/live`);
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
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    fontSize: typography.sm,
    fontWeight: typography.semibold,
    color: colors.textMuted,
  },
  val: {
    fontSize: typography.base - 0.5,
    fontWeight: typography.black,
    color: colors.textPrimary,
  },
  btnGroup: {
    width: "100%",
    gap: spacing.sm,
  },
});
