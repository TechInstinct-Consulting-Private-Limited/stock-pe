import React from "react";
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radii, shadows, spacing, typography } from "../../theme";
import PrimaryButton from "../../components/ui/PrimaryButton";
import AppCard from "../../components/ui/AppCard";

export default function TeamPreviewModal({
  visible,
  contest,
  selectedStocks = [],
  captain,
  viceCaptain,
  creditsUsed,
  onClose,
  onConfirmJoin,
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Squad Lineup Preview</Text>
              <Text style={styles.subtitle}>{contest?.title}</Text>
            </View>

            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={20} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Quick Lineup Stats */}
          <View style={styles.statsStrip}>
            <View style={styles.statCol}>
              <Text style={styles.statLabel}>STOCKS</Text>
              <Text style={styles.statVal}>{selectedStocks.length} / 6</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statCol}>
              <Text style={styles.statLabel}>CREDITS USED</Text>
              <Text style={styles.statVal}>{creditsUsed.toFixed(1)} / 100</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statCol}>
              <Text style={styles.statLabel}>ENTRY FEE</Text>
              <Text style={[styles.statVal, { color: colors.primary }]}>
                {contest?.entryFeeInr}
              </Text>
            </View>
          </View>

          {/* Lineup Grid */}
          <ScrollView style={styles.stocksScroll} showsVerticalScrollIndicator={false}>
            <View style={styles.grid}>
              {selectedStocks.map((stock) => {
                const isC = captain === stock.symbol;
                const isVC = viceCaptain === stock.symbol;
                const isLong = stock.type === "LONG";

                return (
                  <AppCard key={stock.symbol} style={styles.stockItem}>
                    <View style={styles.badgeRow}>
                      {isC && (
                        <View style={styles.captainBadge}>
                          <Text style={styles.captainText}>👑 2x C</Text>
                        </View>
                      )}
                      {isVC && (
                        <View style={styles.vcBadge}>
                          <Text style={styles.vcText}>⭐ 1.5x VC</Text>
                        </View>
                      )}
                      <View
                        style={[
                          styles.typeTag,
                          { backgroundColor: isLong ? colors.primaryLight : colors.dangerBg },
                        ]}
                      >
                        <Text
                          style={[
                            styles.typeText,
                            { color: isLong ? colors.primary : colors.danger },
                          ]}
                        >
                          {isLong ? "LONG 🚀" : "SHORT 🔻"}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.stockSymbol}>{stock.symbol}</Text>
                    <Text style={styles.stockSector}>{stock.sector}</Text>
                    <Text style={styles.stockPrice}>₹{stock.price}</Text>
                  </AppCard>
                );
              })}
            </View>
          </ScrollView>

          {/* Action CTA */}
          <View style={styles.footerCTA}>
            <PrimaryButton
              title={`CONFIRM & PAY ${contest?.entryFeeInr}`}
              iconName="flash"
              onPress={onConfirmJoin}
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
    justifyContent: "flex-end",
  },
  sheetContainer: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.xxl,
    borderTopRightRadius: radii.xxl,
    paddingHorizontal: spacing.base,
    paddingTop: spacing.base,
    paddingBottom: spacing.xl,
    maxHeight: "85%",
    ...shadows.lg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.lg,
    fontWeight: typography.black,
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: typography.xs + 1,
    fontWeight: typography.bold,
    color: colors.textMuted,
    marginTop: 2,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: radii.md,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  statsStrip: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: radii.md,
    marginBottom: spacing.base,
  },
  statCol: {
    alignItems: "center",
    flex: 1,
  },
  statLabel: {
    fontSize: typography.xs - 0.5,
    fontWeight: typography.black,
    color: colors.textLight,
    letterSpacing: typography.wide,
    marginBottom: 2,
  },
  statVal: {
    fontSize: typography.base,
    fontWeight: typography.black,
    color: colors.textPrimary,
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: colors.borderMedium,
  },
  stocksScroll: {
    marginBottom: spacing.base,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    justifyContent: "space-between",
  },
  stockItem: {
    width: "48%",
    padding: spacing.md,
    marginBottom: spacing.xs,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    marginBottom: 6,
  },
  captainBadge: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radii.xs,
  },
  captainText: {
    fontSize: typography.xs - 1,
    fontWeight: typography.black,
    color: "#B45309",
  },
  vcBadge: {
    backgroundColor: "#E0F2FE",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radii.xs,
  },
  vcText: {
    fontSize: typography.xs - 1,
    fontWeight: typography.black,
    color: "#0369A1",
  },
  typeTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radii.xs,
  },
  typeText: {
    fontSize: typography.xs - 1,
    fontWeight: typography.black,
  },
  stockSymbol: {
    fontSize: typography.base,
    fontWeight: typography.black,
    color: colors.textPrimary,
  },
  stockSector: {
    fontSize: typography.xs,
    fontWeight: typography.semibold,
    color: colors.textMuted,
    marginTop: 1,
  },
  stockPrice: {
    fontSize: typography.sm,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginTop: 4,
  },
  footerCTA: {
    marginTop: spacing.xs,
  },
});
