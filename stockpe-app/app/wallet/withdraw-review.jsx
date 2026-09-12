import { Ionicons } from "@expo/vector-icons";
import QRCode from "react-native-qrcode-svg";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { getUserFacingError, simulateMockWithdrawal } from "../../src/services/api";
import WalletShell from "../../src/features/wallet/WalletShell";
import { formatInr, formatUsdt, shortenAddress } from "../../src/features/wallet/wallet-format";

export default function WithdrawReviewScreen() {
    const { amount, destination } = useLocalSearchParams();
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const amountValue = String(amount || "0");
    const address = String(destination || "");

    const confirm = async () => {
        setSubmitting(true); setError("");
        try {
            const key = `wallet-demo-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
            const result = await simulateMockWithdrawal(amountValue, key);
            router.replace({ pathname: "/wallet/withdraw-success", params: { amount: amountValue, destination: address, txHash: result.withdrawal?.tx_hash || "mock-confirmed" } });
        } catch (submitError) {
            setError(getUserFacingError(submitError, "Mock withdrawal could not be completed."));
        } finally { setSubmitting(false); }
    };

    return <WalletShell><ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.pageTitle}><TouchableOpacity onPress={() => router.back()} style={styles.back}><Ionicons name="chevron-back" size={25} color="#718095" /></TouchableOpacity><View><Text style={styles.title}>Withdraw USDT</Text><Text style={styles.subtitle}>Review & confirm</Text></View><Text style={styles.step}>3/3</Text></View><View style={styles.progress} />
        <View style={styles.card}><Text style={styles.cardHeader}>TRANSFER SUMMARY</Text><View style={styles.row}><Text style={styles.rowLabel}>Amount</Text><View><Text style={styles.rowValue}>{formatUsdt(amountValue)} USDT</Text><Text style={styles.rowSub}>{formatInr(amountValue)}</Text></View></View><View style={styles.row}><Text style={styles.rowLabel}>Network</Text><View><Text style={styles.rowValue}>TRC20</Text><Text style={styles.rowSub}>Mock confirmation</Text></View></View><View style={styles.row}><Text style={styles.rowLabel}>Demo fee</Text><Text style={styles.rowValue}>0.00 USDT</Text></View><View style={[styles.row, styles.receive]}><Text style={styles.rowLabel}>You Get</Text><Text style={styles.receiveValue}>{formatUsdt(amountValue)} USDT</Text></View></View>
        <View style={styles.destination}><Text style={styles.cardHeader}>DESTINATION</Text><Text style={styles.fullAddress}>{address}</Text></View>
        <View style={styles.qrPreview}><View style={styles.qr}><QRCode value={address} size={92} /></View><View><Text style={styles.previewTitle}>Recipient QR Preview</Text><Text style={styles.previewAddress}>{shortenAddress(address)}</Text><Text style={styles.previewAmount}>{formatUsdt(amountValue)} USDT arriving in demo</Text></View></View>
        {error ? <Text style={styles.error}>{error}</Text> : null}<TouchableOpacity disabled={submitting || !address} onPress={confirm} style={[styles.confirm, submitting && styles.disabled]}><Ionicons name="paper-plane-outline" size={25} color="#FFFFFF" /><Text style={styles.confirmText}>{submitting ? "PROCESSING DEMO…" : "CONFIRM WITHDRAWAL"}</Text></TouchableOpacity><Text style={styles.note}>Demo action only — no blockchain transfer is broadcast.</Text>
    </ScrollView></WalletShell>;
}

const styles = StyleSheet.create({
    scroll: { paddingBottom: 32 }, pageTitle: { alignItems: "center", backgroundColor: "#FFFFFF", flexDirection: "row", minHeight: 100, paddingHorizontal: 24 }, back: { alignItems: "center", backgroundColor: "#F0F4FC", borderRadius: 19, height: 50, justifyContent: "center", marginRight: 17, width: 50 }, title: { color: "#142039", fontSize: 25, fontWeight: "900" }, subtitle: { color: "#7B8799", fontFamily: "monospace", fontSize: 11, marginTop: 3 }, step: { backgroundColor: "#F0F4FC", borderRadius: 16, color: "#657187", fontFamily: "monospace", fontSize: 12, marginLeft: "auto", paddingHorizontal: 13, paddingVertical: 8 }, progress: { backgroundColor: "#08B778", height: 3 }, card: { backgroundColor: "#FFFFFF", borderRadius: 21, margin: 24, overflow: "hidden" }, cardHeader: { color: "#6C788B", fontFamily: "monospace", fontSize: 10, letterSpacing: 1.5, padding: 20 }, row: { alignItems: "center", borderTopColor: "#EDF0F5", borderTopWidth: 1, flexDirection: "row", justifyContent: "space-between", minHeight: 79, paddingHorizontal: 25 }, rowLabel: { color: "#69758A", fontFamily: "monospace", fontSize: 13 }, rowValue: { color: "#1D283E", fontFamily: "monospace", fontSize: 16, fontWeight: "800", textAlign: "right" }, rowSub: { color: "#7E899A", fontFamily: "monospace", fontSize: 10, marginTop: 4, textAlign: "right" }, receive: { backgroundColor: "#E9FAF5" }, receiveValue: { color: "#08A878", fontFamily: "monospace", fontSize: 16, fontWeight: "900" }, destination: { backgroundColor: "#FFFFFF", borderRadius: 20, marginHorizontal: 24, paddingBottom: 21 }, fullAddress: { color: "#263247", fontFamily: "monospace", fontSize: 14, lineHeight: 24, paddingHorizontal: 20 }, qrPreview: { alignItems: "center", backgroundColor: "#EEF2FF", borderRadius: 20, flexDirection: "row", gap: 17, margin: 24, padding: 18 }, qr: { backgroundColor: "#FFFFFF", borderRadius: 15, padding: 9 }, previewTitle: { color: "#68758A", fontFamily: "monospace", fontSize: 11 }, previewAddress: { color: "#1D283E", fontFamily: "monospace", fontSize: 13, marginTop: 8 }, previewAmount: { color: "#68758A", fontFamily: "monospace", fontSize: 10, marginTop: 7 }, error: { color: "#D54C62", marginHorizontal: 24, textAlign: "center" }, confirm: { alignItems: "center", backgroundColor: "#08B778", borderRadius: 19, flexDirection: "row", gap: 12, justifyContent: "center", marginHorizontal: 24, minHeight: 67 }, disabled: { opacity: 0.55 }, confirmText: { color: "#FFFFFF", fontSize: 19, fontWeight: "900" }, note: { color: "#D06C78", fontFamily: "monospace", fontSize: 10, marginTop: 17, textAlign: "center" },
});
