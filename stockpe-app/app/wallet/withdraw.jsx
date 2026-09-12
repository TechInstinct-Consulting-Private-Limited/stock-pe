import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

import { getUserFacingError, getWalletPaymentSummary } from "../../src/services/api";
import WalletShell from "../../src/features/wallet/WalletShell";
import { formatInr, formatUsdt, numericUsdt } from "../../src/features/wallet/wallet-format";

export default function WithdrawAmountScreen() {
    const [balance, setBalance] = useState(0);
    const [amount, setAmount] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const numericAmount = numericUsdt(amount);
    const valid = numericAmount > 0 && numericAmount <= balance;

    const load = useCallback(async () => {
        try { const summary = await getWalletPaymentSummary(); setBalance(numericUsdt(summary.availableBalanceUsdt)); }
        catch (loadError) { setError(getUserFacingError(loadError, "Wallet balance is unavailable.")); }
        finally { setLoading(false); }
    }, []);
    useEffect(() => { load(); }, [load]);

    return <WalletShell><ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.pageTitle}><TouchableOpacity onPress={() => router.back()} style={styles.back}><Ionicons name="chevron-back" size={25} color="#718095" /></TouchableOpacity><View><Text style={styles.title}>Withdraw USDT</Text><Text style={styles.subtitle}>Enter amount</Text></View><Text style={styles.step}>1/3</Text></View><View style={[styles.progress, { width: "34%" }]} />
        {loading ? <ActivityIndicator color="#08B778" style={styles.loading} /> : <>
            <View style={styles.balanceBox}><Text style={styles.label}>AVAILABLE BALANCE</Text><Text style={styles.balance}>{formatUsdt(balance)} <Text style={styles.balanceUnit}>USDT</Text></Text><Text style={styles.inr}>{formatInr(balance)}</Text></View>
            <Text style={styles.fieldLabel}>AMOUNT (USDT)</Text><View style={styles.inputBox}><View style={styles.coin}><Text style={styles.coinText}>₮</Text></View><TextInput value={amount} onChangeText={(value) => { setAmount(value.replace(/[^0-9.]/g, "")); setError(""); }} placeholder="0.00" keyboardType="decimal-pad" style={styles.input} /><TouchableOpacity onPress={() => setAmount(String(balance))}><Text style={styles.max}>MAX</Text></TouchableOpacity></View>
            <Text style={styles.fieldLabel}>NETWORK</Text><View style={styles.network}><Text style={styles.networkName}>TRC20</Text><Text style={styles.networkInfo}>Mock · instant</Text></View>
            <View style={styles.summary}><View style={styles.summaryRow}><Text style={styles.summaryLabel}>Amount</Text><Text style={styles.summaryValue}>{formatUsdt(numericAmount)} USDT</Text></View><View style={styles.summaryRow}><Text style={styles.summaryLabel}>Demo fee</Text><Text style={styles.summaryValue}>0.00 USDT</Text></View><View style={[styles.summaryRow, styles.receive]}><Text style={styles.summaryLabel}>You Get</Text><Text style={styles.receiveValue}>{formatUsdt(numericAmount)} USDT</Text></View></View>
            {error ? <Text style={styles.error}>{error}</Text> : null}{amount && !valid ? <Text style={styles.error}>Enter an amount within your available balance.</Text> : null}
            <TouchableOpacity disabled={!valid} onPress={() => router.push({ pathname: "/wallet/withdraw-destination", params: { amount: String(numericAmount) } })} style={[styles.continue, !valid && styles.disabled]}><Text style={styles.continueText}>CONTINUE</Text><Ionicons name="arrow-forward" size={27} color="#FFFFFF" /></TouchableOpacity>
        </>}
    </ScrollView></WalletShell>;
}

const styles = StyleSheet.create({
    scroll: { paddingBottom: 32 }, pageTitle: { alignItems: "center", backgroundColor: "#FFFFFF", flexDirection: "row", minHeight: 100, paddingHorizontal: 24 }, back: { alignItems: "center", backgroundColor: "#F0F4FC", borderRadius: 19, height: 50, justifyContent: "center", marginRight: 17, width: 50 }, title: { color: "#142039", fontSize: 25, fontWeight: "900" }, subtitle: { color: "#7B8799", fontFamily: "monospace", fontSize: 11, marginTop: 3 }, step: { backgroundColor: "#F0F4FC", borderRadius: 16, color: "#657187", fontFamily: "monospace", fontSize: 12, marginLeft: "auto", paddingHorizontal: 13, paddingVertical: 8 }, progress: { backgroundColor: "#08B778", height: 3 }, loading: { marginTop: 70 }, balanceBox: { backgroundColor: "#EAF8FB", borderColor: "#B5E5E1", borderRadius: 30, borderWidth: 1, margin: 24, padding: 25 }, label: { color: "#728095", fontFamily: "monospace", fontSize: 10, letterSpacing: 1.7 }, balance: { color: "#08B778", fontFamily: "monospace", fontSize: 48, fontWeight: "900", marginTop: 15 }, balanceUnit: { color: "#687588", fontSize: 22, fontWeight: "400" }, inr: { color: "#687588", fontFamily: "monospace", fontSize: 13, marginTop: 5 }, fieldLabel: { color: "#6C788B", fontFamily: "monospace", fontSize: 10, letterSpacing: 1.5, marginLeft: 24, marginTop: 4 }, inputBox: { alignItems: "center", backgroundColor: "#FFFFFF", borderColor: "#08B778", borderRadius: 20, borderWidth: 2, flexDirection: "row", margin: 14, marginHorizontal: 24, minHeight: 95, paddingHorizontal: 20 }, coin: { alignItems: "center", backgroundColor: "#08A878", borderRadius: 17, height: 36, justifyContent: "center", width: 36 }, coinText: { color: "#FFFFFF", fontSize: 20, fontWeight: "900" }, input: { color: "#142039", flex: 1, fontSize: 36, fontWeight: "800", marginLeft: 15 }, max: { color: "#08A878", fontFamily: "monospace", fontSize: 11, fontWeight: "900" }, network: { alignItems: "center", backgroundColor: "#E5F7F4", borderColor: "#8DD9CD", borderRadius: 17, borderWidth: 1, margin: 14, marginLeft: 24, padding: 15, width: 180 }, networkName: { color: "#08A878", fontSize: 18, fontWeight: "800" }, networkInfo: { color: "#708092", fontFamily: "monospace", fontSize: 10, marginTop: 3 }, summary: { backgroundColor: "#FFFFFF", borderRadius: 19, margin: 12, marginHorizontal: 24, overflow: "hidden" }, summaryRow: { alignItems: "center", borderBottomColor: "#EDF0F5", borderBottomWidth: 1, flexDirection: "row", justifyContent: "space-between", minHeight: 55, paddingHorizontal: 25 }, summaryLabel: { color: "#6D788B", fontFamily: "monospace", fontSize: 12 }, summaryValue: { color: "#1E2A40", fontFamily: "monospace", fontSize: 14, fontWeight: "800" }, receive: { backgroundColor: "#E9FAF5", borderBottomWidth: 0 }, receiveValue: { color: "#08A878", fontFamily: "monospace", fontSize: 14, fontWeight: "900" }, error: { color: "#D54C62", marginHorizontal: 24, marginTop: 8, textAlign: "center" }, continue: { alignItems: "center", backgroundColor: "#08B778", borderRadius: 19, flexDirection: "row", gap: 13, justifyContent: "center", margin: 24, minHeight: 67 }, disabled: { opacity: 0.42 }, continueText: { color: "#FFFFFF", fontSize: 21, fontWeight: "900" },
});
