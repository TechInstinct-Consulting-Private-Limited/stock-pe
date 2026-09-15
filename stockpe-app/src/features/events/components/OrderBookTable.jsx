import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, spacing, typography } from "../../../theme";
import AppCard from "../../../components/ui/AppCard";

export default function OrderBookTable({ event }) {
  const yesOrders = event?.orderBook?.yes || [];
  const noOrders = event?.orderBook?.no || [];

  return (
    <AppCard style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.columnHeader}>
          <Text style={[styles.headerText, { color: colors.primary }]}>
            BUY YES (Qty @ ₹)
          </Text>
        </View>
        <View style={styles.columnHeader}>
          <Text style={[styles.headerText, { color: colors.danger }]}>
            BUY NO (Qty @ ₹)
          </Text>
        </View>
      </View>

      {/* Rows */}
      <View style={styles.rowsContainer}>
        {yesOrders.map((yItem, idx) => {
          const noItem = noOrders[idx] || { qty: "-", price: "-" };
          return (
            <View key={idx} style={styles.row}>
              <View style={styles.cellYes}>
                <Text style={styles.qtyText}>{yItem.qty}</Text>
                <Text style={styles.priceYes}>₹{yItem.price}</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.cellNo}>
                <Text style={styles.priceNo}>₹{noItem.price}</Text>
                <Text style={styles.qtyText}>{noItem.qty}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    marginBottom: spacing.xs + 2,
  },
  columnHeader: {
    flex: 1,
  },
  headerText: {
    fontSize: typography.sm - 0.5,
    fontWeight: typography.black,
    letterSpacing: typography.wide,
  },
  rowsContainer: {
    gap: spacing.xs + 2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.xs,
  },
  cellYes: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingRight: spacing.md,
  },
  cellNo: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingLeft: spacing.md,
  },
  divider: {
    width: 1,
    height: 18,
    backgroundColor: colors.borderMedium,
  },
  qtyText: {
    fontSize: typography.sm,
    fontWeight: typography.semibold,
    color: colors.textMuted,
  },
  priceYes: {
    fontSize: typography.sm + 0.5,
    fontWeight: typography.black,
    color: colors.primary,
  },
  priceNo: {
    fontSize: typography.sm + 0.5,
    fontWeight: typography.black,
    color: colors.danger,
  },
});
