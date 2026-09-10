import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function QrScannerScreen() {
  const router = useRouter();
  const [torchOn, setTorchOn] = useState(false);

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
      <View style={styles.screen}>
        {/* Top Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Scan QR Code</Text>
          <TouchableOpacity
            onPress={() => setTorchOn(!torchOn)}
            style={styles.torchBtn}
            activeOpacity={0.7}
          >
            <Ionicons
              name={torchOn ? "flash" : "flash-outline"}
              size={22}
              color={torchOn ? "#F59E0B" : "#FFFFFF"}
            />
          </TouchableOpacity>
        </View>

        {/* Scanner Viewfinder Box */}
        <View style={styles.scannerBody}>
          <Text style={styles.instruction}>
            Scan any USDT Crypto Wallet QR code (TRC20, BEP20, Polygon) to deposit or transfer funds instantly
          </Text>

          <View style={styles.viewfinderFrame}>
            {/* Corner Markers */}
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />

            {/* Animated Laser Guide Line */}
            <View style={styles.laserGuide} />

            <Ionicons name="qr-code-outline" size={80} color="rgba(255,255,255,0.2)" />
          </View>

          <View style={styles.supportedRow}>
            <Ionicons name="shield-checkmark-outline" size={16} color="#00C987" />
            <Text style={styles.supportedText}>
              Supports TRC-20, BEP-20, Polygon & Web3 QRs
            </Text>
          </View>
        </View>

        {/* Bottom Manual Option */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.manualBtn}
            onPress={() => router.push("/wallet/deposit")}
            activeOpacity={0.85}
          >
            <Ionicons name="wallet-outline" size={18} color="#00C987" />
            <Text style={styles.manualBtnText}>VIEW USDT DEPOSIT ADDRESS</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0F172A",
  },
  screen: {
    flex: 1,
    backgroundColor: "#0F172A",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#0F172A",
  },
  backBtn: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  torchBtn: {
    padding: 6,
  },
  scannerBody: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  instruction: {
    fontSize: 13,
    color: "#94A3B8",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 18,
  },
  viewfinderFrame: {
    width: 250,
    height: 250,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(30, 41, 59, 0.4)",
    borderRadius: 24,
  },
  corner: {
    position: "absolute",
    width: 28,
    height: 28,
    borderColor: "#00C987",
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 16,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 16,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 16,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 16,
  },
  laserGuide: {
    position: "absolute",
    width: "85%",
    height: 2,
    backgroundColor: "#00C987",
    shadowColor: "#00C987",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  supportedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 32,
    backgroundColor: "rgba(30, 41, 59, 0.6)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  supportedText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#94A3B8",
  },
  bottomBar: {
    padding: 20,
    paddingBottom: 34,
    backgroundColor: "#1E293B",
  },
  manualBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#0F172A",
    borderWidth: 1.5,
    borderColor: "#00C987",
    paddingVertical: 14,
    borderRadius: 14,
  },
  manualBtnText: {
    color: "#00C987",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
});
