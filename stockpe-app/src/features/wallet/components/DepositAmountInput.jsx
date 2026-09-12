import React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function DepositAmountInput({
  amount,
  setAmount,
  usdtEquivalent,
  quickAmounts,
  onSelectQuickAmount,
}) {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.label}>ENTER DEPOSIT AMOUNT</Text>
        <View style={styles.usdtTag}>
          <Text style={styles.usdtSymbol}>₮</Text>
          <Text style={styles.usdtText}>~{usdtEquivalent} USDT</Text>
        </View>
      </View>

      {/* Main Input Box */}
      <View style={styles.inputContainer}>
        <Text style={styles.currencySymbol}>₹</Text>
        <TextInput
          style={styles.textInput}
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          placeholder="0"
          placeholderTextColor="#94A3B8"
          maxLength={7}
        />
        {amount.length > 0 && (
          <TouchableOpacity
            onPress={() => setAmount("")}
            style={styles.clearBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close-circle" size={20} color="#94A3B8" />
          </TouchableOpacity>
        )}
      </View>

      {/* Quick Amount Chips */}
      <View style={styles.quickChipsRow}>
        {quickAmounts.map((item) => {
          const isSelected = amount === item.value;
          return (
            <TouchableOpacity
              key={item.value}
              onPress={() => onSelectQuickAmount(item.value)}
              activeOpacity={0.75}
              style={[
                styles.chip,
                isSelected && styles.chipSelected,
                item.isPopular && !isSelected && styles.chipPopular,
              ]}
            >
              {item.isPopular && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularBadgeText}>POPULAR</Text>
                </View>
              )}
              <Text
                style={[
                  styles.chipText,
                  isSelected && styles.chipTextSelected,
                  item.isPopular && !isSelected && styles.chipTextPopular,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#EDF2F7",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 18,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  label: {
    fontSize: 11,
    fontWeight: "800",
    color: "#64748B",
    letterSpacing: 0.8,
  },
  usdtTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E6FBF3",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  usdtSymbol: {
    fontSize: 11,
    fontWeight: "900",
    color: "#00C987",
    marginRight: 3,
  },
  usdtText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#00C987",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    marginBottom: 16,
  },
  currencySymbol: {
    fontSize: 32,
    fontWeight: "900",
    color: "#0F172A",
    marginRight: 6,
  },
  textInput: {
    flex: 1,
    fontSize: 32,
    fontWeight: "900",
    color: "#0F172A",
    padding: 0,
  },
  clearBtn: {
    padding: 4,
  },
  quickChipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    position: "relative",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  chipSelected: {
    backgroundColor: "#E6FBF3",
    borderColor: "#00C987",
  },
  chipPopular: {
    borderColor: "#CBD5E1",
    backgroundColor: "#FFFFFF",
  },
  chipText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#475569",
  },
  chipTextSelected: {
    color: "#00C987",
  },
  chipTextPopular: {
    color: "#0F172A",
  },
  popularBadge: {
    position: "absolute",
    top: -8,
    right: 4,
    backgroundColor: "#00C987",
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  popularBadgeText: {
    fontSize: 7.5,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 0.4,
  },
});
