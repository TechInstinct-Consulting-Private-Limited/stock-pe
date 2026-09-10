import React from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function WalletSuccessModal({
  visible,
  onClose,
  type = "deposit", // "deposit" | "withdraw"
  data,
}) {
  if (!data) return null;

  const isDeposit = type === "deposit";

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Animated Success Icon Circle */}
          <View style={styles.iconCircle}>
            <Ionicons name="checkmark-circle" size={56} color="#00C987" />
          </View>

          <Text style={styles.title}>
            {isDeposit ? "Deposit Successful!" : "Withdrawal Initiated!"}
          </Text>
          <Text style={styles.subtitle}>
            {isDeposit
              ? "Funds added instantly to your trading balance."
              : "Payout is being dispatched to your verified account."}
          </Text>

          {/* Amount Box */}
          <View style={styles.amountBox}>
            <Text style={styles.amountLabel}>
              {isDeposit ? "AMOUNT CREDITED" : "NET PAYOUT"}
            </Text>
            <Text style={styles.amountValue}>
              ${(isDeposit ? data.amountUsdt : data.netPayoutUsdt || data.amountUsdt)?.toFixed(2)} USDT
            </Text>
            <Text style={styles.amountUsdt}>
              ≈ ₹{(isDeposit ? data.amountInr : data.netPayoutInr || data.amountInr)?.toLocaleString("en-IN")}
            </Text>
          </View>

          {/* Breakdown / Metadata */}
          <View style={styles.metaContainer}>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Transaction ID</Text>
              <Text style={styles.metaVal}>{data.transactionId}</Text>
            </View>

            {data.network && (
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Network</Text>
                <Text style={[styles.metaVal, { color: "#00A86B" }]}>{data.network}</Text>
              </View>
            )}

            {data.txHash && (
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Blockchain TxID</Text>
                <Text style={[styles.metaVal, { fontFamily: "monospace", color: "#64748B" }]}>
                  {data.txHash}
                </Text>
              </View>
            )}

            {isDeposit && data.bonusCreditedUsdt > 0 && (
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Bonus USDT Credited</Text>
                <Text style={[styles.metaVal, { color: "#00C987" }]}>
                  +${data.bonusCreditedUsdt} USDT
                </Text>
              </View>
            )}

            {!isDeposit && (
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Estimated Arrival</Text>
                <Text style={styles.metaVal}>
                  {data.estimatedArrival || "1-3 minutes"}
                </Text>
              </View>
            )}

            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Status</Text>
              <View style={styles.statusPill}>
                <Text style={styles.statusPillText}>CONFIRMED</Text>
              </View>
            </View>
          </View>

          {/* Primary Action Button */}
          <TouchableOpacity
            style={styles.doneBtn}
            onPress={onClose}
            activeOpacity={0.85}
          >
            <Text style={styles.doneBtnText}>DONE</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.75)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    width: "100%",
    maxWidth: 380,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  iconCircle: {
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "900",
    color: "#0F172A",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 12.5,
    color: "#64748B",
    textAlign: "center",
    marginTop: 6,
    lineHeight: 18,
  },
  amountBox: {
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 20,
    width: "100%",
    alignItems: "center",
    marginVertical: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  amountLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "#94A3B8",
    letterSpacing: 0.6,
  },
  amountValue: {
    fontSize: 28,
    fontWeight: "900",
    color: "#00C987",
    marginVertical: 2,
  },
  amountUsdt: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748B",
  },
  metaContainer: {
    width: "100%",
    gap: 8,
    marginBottom: 20,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  metaLabel: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "600",
  },
  metaVal: {
    fontSize: 12.5,
    fontWeight: "800",
    color: "#0F172A",
  },
  statusPill: {
    backgroundColor: "#E6FBF3",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusPillText: {
    fontSize: 9.5,
    fontWeight: "900",
    color: "#00C987",
  },
  doneBtn: {
    backgroundColor: "#00C987",
    width: "100%",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  doneBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 0.6,
  },
});
