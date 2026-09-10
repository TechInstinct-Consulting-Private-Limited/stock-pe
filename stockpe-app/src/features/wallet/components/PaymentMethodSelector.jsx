import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SUPPORTED_USDT_NETWORKS } from "../services/walletService";

export default function PaymentMethodSelector({
  selectedNetwork = "trc20",
  onSelectNetwork,
  txHash,
  setTxHash,
}) {
  const [copied, setCopied] = useState(false);

  const activeNetwork =
    SUPPORTED_USDT_NETWORKS.find((n) => n.id === selectedNetwork) ||
    SUPPORTED_USDT_NETWORKS[0];

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <View style={styles.card}>
      {/* Title */}
      <View style={styles.headerRow}>
        <View style={styles.titleWithBadge}>
          <Text style={styles.sectionTitle}>USDT CRYPTO DEPOSIT HUB</Text>
          <View style={styles.cryptoBadge}>
            <Text style={styles.cryptoBadgeText}>TRC20 • BEP20 • POLYGON</Text>
          </View>
        </View>
      </View>

      {/* Network Selectors */}
      <Text style={styles.subLabel}>1. SELECT TRANSFER NETWORK</Text>
      <View style={styles.networksGrid}>
        {SUPPORTED_USDT_NETWORKS.map((net) => {
          const isSelected = selectedNetwork === net.id;
          return (
            <TouchableOpacity
              key={net.id}
              style={[
                styles.networkCard,
                isSelected && styles.networkCardSelected,
              ]}
              onPress={() => onSelectNetwork && onSelectNetwork(net.id)}
              activeOpacity={0.7}
            >
              <View style={styles.networkCardTop}>
                <Text
                  style={[
                    styles.networkShort,
                    isSelected && styles.networkShortSelected,
                  ]}
                >
                  {net.shortName}
                </Text>
                {net.badge && (
                  <View
                    style={[
                      styles.netBadge,
                      { backgroundColor: isSelected ? "#00C987" : "#E2E8F0" },
                    ]}
                  >
                    <Text
                      style={[
                        styles.netBadgeText,
                        { color: isSelected ? "#FFFFFF" : "#64748B" },
                      ]}
                    >
                      {net.badge}
                    </Text>
                  </View>
                )}
              </View>
              <Text style={styles.networkFeeText}>
                Fee: ~${net.networkFeeUsdt} • {net.confirmationTime}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Deposit QR & Address Section */}
      <View style={styles.addressSection}>
        <Text style={styles.subLabel}>2. SEND USDT TO THIS DEPOSIT ADDRESS</Text>

        {/* Visual QR & Details */}
        <View style={styles.qrContainer}>
          <View style={styles.qrBox}>
            <Ionicons name="qr-code-outline" size={76} color="#0F172A" />
            <View style={styles.qrTetherIcon}>
              <Text style={styles.qrTetherText}>₮</Text>
            </View>
          </View>
          <View style={styles.qrInstructions}>
            <Text style={styles.qrNetworkTitle}>
              {activeNetwork.name}
            </Text>
            <Text style={styles.qrNetworkDesc}>
              Scan from Binance, OKX, TrustWallet, or MetaMask
            </Text>
            <View style={styles.minPill}>
              <Ionicons name="shield-checkmark" size={12} color="#00C987" />
              <Text style={styles.minPillText}>
                Min Deposit: ${activeNetwork.minDepositUsdt} USDT
              </Text>
            </View>
          </View>
        </View>

        {/* Copyable Address Box */}
        <View style={styles.addressBox}>
          <View style={styles.addressTextWrapper}>
            <Text style={styles.addressLabel}>OFFICIAL DEPOSIT ADDRESS</Text>
            <Text style={styles.addressString} numberOfLines={1} ellipsizeMode="middle">
              {activeNetwork.depositAddress}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.copyBtn, copied && styles.copyBtnSuccess]}
            onPress={handleCopy}
            activeOpacity={0.8}
          >
            <Ionicons
              name={copied ? "checkmark" : "copy-outline"}
              size={15}
              color={copied ? "#FFFFFF" : "#00C987"}
            />
            <Text
              style={[
                styles.copyBtnText,
                copied && styles.copyBtnTextSuccess,
              ]}
            >
              {copied ? "COPIED" : "COPY"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Transaction Hash / TxID Input */}
      <View style={styles.txHashSection}>
        <Text style={styles.subLabel}>3. BLOCKCHAIN TXID / TRANSACTION HASH (OPTIONAL)</Text>
        <View style={styles.txInputContainer}>
          <Ionicons name="receipt-outline" size={18} color="#94A3B8" />
          <TextInput
            style={styles.txInput}
            placeholder="Paste 0x... or Tron TxID for instant sync"
            placeholderTextColor="#94A3B8"
            value={txHash}
            onChangeText={setTxHash}
            autoCapitalize="none"
          />
        </View>
      </View>

      {/* Security Warning Notice */}
      <View style={styles.securityAlert}>
        <Ionicons name="alert-circle-outline" size={16} color="#D97706" />
        <Text style={styles.securityText}>
          Send only <Text style={{ fontWeight: "800", color: "#0F172A" }}>USDT</Text> via the selected <Text style={{ fontWeight: "800", color: "#0F172A" }}>{activeNetwork.shortName}</Text> network. Transfers are credited automatically after 1 block confirmation.
        </Text>
      </View>
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
    marginBottom: 14,
  },
  titleWithBadge: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "900",
    color: "#0F172A",
    letterSpacing: 0.8,
  },
  cryptoBadge: {
    backgroundColor: "#E6FBF3",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  cryptoBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#00A86B",
  },
  subLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "#64748B",
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 4,
  },
  networksGrid: {
    gap: 8,
    marginBottom: 16,
  },
  networkCard: {
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    padding: 12,
    backgroundColor: "#F8FAFC",
  },
  networkCardSelected: {
    borderColor: "#00C987",
    backgroundColor: "#F0FDF4",
  },
  networkCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  networkShort: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1E293B",
  },
  networkShortSelected: {
    color: "#00A86B",
    fontWeight: "900",
  },
  netBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  netBadgeText: {
    fontSize: 9.5,
    fontWeight: "800",
  },
  networkFeeText: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "600",
  },
  addressSection: {
    marginBottom: 14,
  },
  qrContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 10,
  },
  qrBox: {
    width: 86,
    height: 86,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    position: "relative",
  },
  qrTetherIcon: {
    position: "absolute",
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#00C987",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  qrTetherText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },
  qrInstructions: {
    flex: 1,
  },
  qrNetworkTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: "#0F172A",
    marginBottom: 2,
  },
  qrNetworkDesc: {
    fontSize: 11,
    color: "#64748B",
    lineHeight: 15,
    marginBottom: 6,
  },
  minPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#E6FBF3",
    alignSelf: "flex-start",
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  minPillText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#00A86B",
  },
  addressBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
  },
  addressTextWrapper: {
    flex: 1,
  },
  addressLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: "#94A3B8",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  addressString: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0F172A",
    fontFamily: "monospace",
  },
  copyBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E6FBF3",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  copyBtnSuccess: {
    backgroundColor: "#00C987",
    borderColor: "#00C987",
  },
  copyBtnText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#00A86B",
  },
  copyBtnTextSuccess: {
    color: "#FFFFFF",
  },
  txHashSection: {
    marginBottom: 14,
  },
  txInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    gap: 8,
  },
  txInput: {
    flex: 1,
    fontSize: 12.5,
    fontWeight: "600",
    color: "#0F172A",
    padding: 0,
  },
  securityAlert: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FFFBEB",
    borderRadius: 12,
    padding: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  securityText: {
    flex: 1,
    fontSize: 10.5,
    color: "#92400E",
    lineHeight: 15,
  },
});

