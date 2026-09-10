import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function ReferralCodeCard({
  referralCode,
  copied,
  onCopyCode,
  rewardPerReferral,
}) {
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.giftCircle}>
          <Ionicons name="gift" size={24} color="#00C987" />
        </View>
        <View style={styles.topInfo}>
          <Text style={styles.title}>INVITE & GET ₹{rewardPerReferral} EACH</Text>
          <Text style={styles.subtitle}>
            Both you and your friend earn instant wallet rewards upon joining.
          </Text>
        </View>
      </View>

      {/* Code Share Box */}
      <View style={styles.codeBox}>
        <View style={styles.codeLeft}>
          <Text style={styles.codeLabel}>YOUR REFERRAL CODE</Text>
          <Text style={styles.codeText}>{referralCode}</Text>
        </View>

        <TouchableOpacity
          style={[styles.copyBtn, copied && styles.copyBtnSuccess]}
          onPress={onCopyCode}
          activeOpacity={0.8}
        >
          <Ionicons
            name={copied ? "checkmark-circle" : "copy-outline"}
            size={16}
            color="#FFFFFF"
          />
          <Text style={styles.copyBtnText}>
            {copied ? "COPIED!" : "COPY CODE"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Social Share Pills */}
      <View style={styles.shareRow}>
        <TouchableOpacity style={styles.whatsappBtn} activeOpacity={0.8}>
          <Ionicons name="logo-whatsapp" size={18} color="#FFFFFF" />
          <Text style={styles.shareBtnText}>WhatsApp</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.telegramBtn} activeOpacity={0.8}>
          <Ionicons name="paper-plane" size={16} color="#FFFFFF" />
          <Text style={styles.shareBtnText}>Telegram</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.moreShareBtn} activeOpacity={0.8}>
          <Ionicons name="share-social" size={16} color="#0F172A" />
          <Text style={styles.moreShareText}>Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#0F172A",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  giftCircle: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#1E293B",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  topInfo: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: "900",
    color: "#00C987",
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 11.5,
    color: "#94A3B8",
    marginTop: 2,
    lineHeight: 16,
  },
  codeBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#1E293B",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#334155",
    marginBottom: 14,
  },
  codeLeft: {
    flex: 1,
  },
  codeLabel: {
    fontSize: 9.5,
    fontWeight: "800",
    color: "#94A3B8",
    letterSpacing: 0.5,
  },
  codeText: {
    fontSize: 18,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 1.5,
    marginTop: 2,
  },
  copyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#00C987",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  copyBtnSuccess: {
    backgroundColor: "#059669",
  },
  copyBtnText: {
    color: "#FFFFFF",
    fontSize: 11.5,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  shareRow: {
    flexDirection: "row",
    gap: 8,
  },
  whatsappBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#25D366",
    paddingVertical: 10,
    borderRadius: 10,
  },
  telegramBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#229ED9",
    paddingVertical: 10,
    borderRadius: 10,
  },
  moreShareBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  shareBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
  moreShareText: {
    color: "#0F172A",
    fontSize: 12,
    fontWeight: "800",
  },
});
