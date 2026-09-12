import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import WalletShell from "../../src/features/wallet/WalletShell";
import { formatUsdt, shortenAddress } from "../../src/features/wallet/wallet-format";

export default function WithdrawSuccessScreen() {
    const { amount, destination, txHash } = useLocalSearchParams();
    const amountValue = String(amount || "0");
    const address = String(destination || "");
    const transactionId = String(txHash || "mock-confirmed");

    return <WalletShell><ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.pageTitle}><View><Text style={styles.title}>Withdraw USDT</Text><Text style={styles.subtitle}>Demo completed</Text></View></View>
        <View style={styles.hero}><View style={styles.ring}><View style={styles.iconCircle}><Ionicons name="paper-plane-outline" size={64} color="#08B778" /></View></View><View style={styles.initiated}><View style={styles.dot} /><Text style={styles.initiatedText}>MOCK WITHDRAWAL COMPLETED</Text></View><Text style={styles.sent}>{formatUsdt(amountValue)} USDT Sent!</Text><Text style={styles.arrival}>Balance updated instantly in demo mode</Text></View>
        <View style={styles.details}><Detail label="Network" value="TRC20" /><Detail label="To" value={shortenAddress(address)} /><Detail label="Status" value="Mock confirmed" /><Detail label="Tx ID" value={shortenAddress(transactionId)} /></View>
        <TouchableOpacity onPress={() => router.replace("/wallet")} style={styles.backButton}><Text style={styles.backText}>BACK TO WALLET</Text></TouchableOpacity>
    </ScrollView></WalletShell>;
}

function Detail({ label, value }) { return <View style={styles.detail}><Text style={styles.detailLabel}>{label}</Text><Text style={styles.detailValue}>{value}</Text></View>; }

const styles = StyleSheet.create({
    scroll: { paddingBottom: 32 }, pageTitle: { backgroundColor: "#FFFFFF", minHeight: 100, justifyContent: "center", paddingHorizontal: 24 }, title: { color: "#142039", fontSize: 25, fontWeight: "900" }, subtitle: { color: "#7B8799", fontFamily: "monospace", fontSize: 11, marginTop: 3 }, hero: { alignItems: "center", marginTop: 47 }, ring: { alignItems: "center", borderColor: "#E1F1EF", borderRadius: 122, borderWidth: 1, height: 210, justifyContent: "center", width: 210 }, iconCircle: { alignItems: "center", backgroundColor: "#E5F8F5", borderColor: "#9DDBD3", borderRadius: 75, borderWidth: 1.5, height: 145, justifyContent: "center", width: 145 }, initiated: { alignItems: "center", flexDirection: "row", gap: 10, marginTop: 30 }, dot: { backgroundColor: "#08B778", borderRadius: 4, height: 7, width: 7 }, initiatedText: { color: "#08A878", fontFamily: "monospace", fontSize: 11, letterSpacing: 3 }, sent: { color: "#152038", fontSize: 33, fontWeight: "900", marginTop: 20 }, arrival: { color: "#737F93", fontSize: 16, marginTop: 9 }, details: { backgroundColor: "#FFFFFF", borderRadius: 21, margin: 24, marginTop: 39, overflow: "hidden" }, detail: { alignItems: "center", borderBottomColor: "#EDF0F5", borderBottomWidth: 1, flexDirection: "row", justifyContent: "space-between", minHeight: 56, paddingHorizontal: 25 }, detailLabel: { color: "#677489", fontFamily: "monospace", fontSize: 12 }, detailValue: { color: "#1D283E", fontFamily: "monospace", fontSize: 12, fontWeight: "800" }, backButton: { alignItems: "center", backgroundColor: "#EEF2FC", borderColor: "#DDE4F0", borderRadius: 19, borderWidth: 1, justifyContent: "center", marginHorizontal: 24, minHeight: 67 }, backText: { color: "#152038", fontSize: 19, fontWeight: "900" },
});
