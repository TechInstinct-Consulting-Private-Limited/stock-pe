import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function WithdrawalAccountCard({
  accounts,
  selectedAccountId,
  onSelectAccount,
  onOpenAddAccount,
}) {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>USDT DESTINATION WALLET</Text>
        <TouchableOpacity
          onPress={onOpenAddAccount}
          activeOpacity={0.7}
          style={styles.addBtn}
        >
          <Ionicons name="add-circle-outline" size={16} color="#00C987" />
          <Text style={styles.addBtnText}>Add USDT Address</Text>
        </TouchableOpacity>
      </View>

      {accounts.map((acc) => {
        const isSelected = selectedAccountId === acc.id;

        return (
          <TouchableOpacity
            key={acc.id}
            onPress={() => onSelectAccount(acc.id)}
            activeOpacity={0.8}
            style={[
              styles.accountRow,
              isSelected && styles.accountRowSelected,
            ]}
          >
            <View style={styles.iconBox}>
              <Ionicons
                name="wallet-outline"
                size={20}
                color="#00C987"
              />
            </View>

            <View style={styles.accountInfo}>
              <View style={styles.titleRow}>
                <Text style={styles.accountTitle}>
                  {acc.label || `${acc.network} Wallet`}
                </Text>
                <View style={styles.netPill}>
                  <Text style={styles.netPillText}>{acc.network}</Text>
                </View>
                {acc.isVerified && (
                  <View style={styles.verifiedTag}>
                    <Ionicons name="checkmark-circle" size={11} color="#00C987" />
                    <Text style={styles.verifiedText}>Verified</Text>
                  </View>
                )}
              </View>
              <Text style={styles.accountDetail}>
                {acc.walletAddressMasked || acc.walletAddress}
              </Text>
            </View>

            <View
              style={[
                styles.radioOuter,
                isSelected && styles.radioOuterSelected,
              ]}
            >
              {isSelected && <View style={styles.radioInner} />}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#EDF2F7",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "900",
    color: "#0F172A",
    letterSpacing: 0.8,
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  addBtnText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#00C987",
  },
  accountRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FAFAFC",
    borderWidth: 1.5,
    borderColor: "#F1F5F9",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  accountRowSelected: {
    borderColor: "#00C987",
    backgroundColor: "#F0FDF4",
    shadowColor: "#00C987",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#E6FBF3",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  accountInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  accountTitle: {
    fontSize: 13.5,
    fontWeight: "800",
    color: "#0F172A",
  },
  netPill: {
    backgroundColor: "#E0F2FE",
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 5,
  },
  netPillText: {
    fontSize: 9.5,
    fontWeight: "800",
    color: "#0284C7",
  },
  verifiedTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    backgroundColor: "#E6FBF3",
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 5,
  },
  verifiedText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#00C987",
  },
  accountDetail: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
    marginTop: 3,
    fontFamily: "monospace",
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#CBD5E1",
    alignItems: "center",
    justifyContent: "center",
  },
  radioOuterSelected: {
    borderColor: "#00C987",
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#00C987",
  },
});

