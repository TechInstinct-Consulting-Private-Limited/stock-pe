import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function TransactionItemCard({ transaction, onPress }) {
  const isCredit = transaction.type === "CREDIT";
  const isPending = transaction.status === "PENDING";
  const isFailed = transaction.status === "FAILED";

  const getIcon = () => {
    if (transaction.category === "CONTESTS") return "trophy";
    if (transaction.category === "EVENTS") return "stats-chart";
    if (isCredit) return "arrow-down-outline";
    return "arrow-up-outline";
  };

  const getIconColor = () => {
    if (transaction.category === "CONTESTS") return "#D97706";
    if (transaction.category === "EVENTS") return "#6366F1";
    if (isCredit) return "#00C987";
    return "#F59E0B";
  };

  const getIconBg = () => {
    if (transaction.category === "CONTESTS") return "#FEF3C7";
    if (transaction.category === "EVENTS") return "#EEF2FF";
    if (isCredit) return "#E6FBF3";
    return "#FEF3C7";
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => onPress(transaction)}
      style={styles.card}
    >
      <View style={[styles.iconBox, { backgroundColor: getIconBg() }]}>
        <Ionicons name={getIcon()} size={20} color={getIconColor()} />
      </View>

      <View style={styles.detailsContainer}>
        <View style={styles.topRow}>
          <Text style={styles.title} numberOfLines={1}>
            {transaction.title}
          </Text>
          <Text
            style={[
              styles.amountInr,
              isCredit ? styles.creditText : styles.debitText,
            ]}
          >
            {isCredit ? "+" : "-"}₹{transaction.amountInr.toLocaleString("en-IN")}
          </Text>
        </View>

        <View style={styles.bottomRow}>
          <View style={styles.dateAndRef}>
            <Text style={styles.date}>{transaction.date}</Text>
            {transaction.refId && (
              <Text style={styles.refId}>• {transaction.refId}</Text>
            )}
          </View>
          <Text style={styles.amountUsdt}>
            {isCredit ? "+" : "-"}
            {transaction.amountUsdt} USDT
          </Text>
        </View>

        {/* Status tag if not normal completed */}
        {(isPending || isFailed || transaction.bonusCreditedInr) && (
          <View style={styles.metaRow}>
            {isPending && (
              <View style={[styles.statusTag, styles.statusPending]}>
                <Text style={styles.statusPendingText}>PROCESSING</Text>
              </View>
            )}
            {isFailed && (
              <View style={[styles.statusTag, styles.statusFailed]}>
                <Text style={styles.statusFailedText}>FAILED</Text>
              </View>
            )}
            {transaction.bonusCreditedInr ? (
              <View style={styles.bonusTag}>
                <Text style={styles.bonusTagText}>
                  +₹{transaction.bonusCreditedInr} Bonus
                </Text>
              </View>
            ) : null}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#EDF2F7",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1.5,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  detailsContainer: {
    flex: 1,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 13.5,
    fontWeight: "800",
    color: "#0F172A",
    flex: 1,
    marginRight: 8,
  },
  amountInr: {
    fontSize: 14.5,
    fontWeight: "900",
  },
  creditText: {
    color: "#00C987",
  },
  debitText: {
    color: "#0F172A",
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 3,
  },
  dateAndRef: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  date: {
    fontSize: 11,
    color: "#94A3B8",
    fontWeight: "600",
  },
  refId: {
    fontSize: 10.5,
    color: "#94A3B8",
    fontWeight: "500",
  },
  amountUsdt: {
    fontSize: 10.5,
    fontWeight: "700",
    color: "#64748B",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
  },
  statusTag: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  statusPending: {
    backgroundColor: "#FEF3C7",
  },
  statusPendingText: {
    fontSize: 8.5,
    fontWeight: "900",
    color: "#D97706",
  },
  statusFailed: {
    backgroundColor: "#FEE2E2",
  },
  statusFailedText: {
    fontSize: 8.5,
    fontWeight: "900",
    color: "#EF4444",
  },
  bonusTag: {
    backgroundColor: "#E6FBF3",
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  bonusTagText: {
    fontSize: 8.5,
    fontWeight: "800",
    color: "#00C987",
  },
});
