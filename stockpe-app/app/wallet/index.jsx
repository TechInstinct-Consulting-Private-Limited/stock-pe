import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { getUserFacingError, getWalletPaymentSummary } from "../../src/services/api";
import WalletShell from "../../src/features/wallet/WalletShell";
import { formatInr, formatUsdt, numericUsdt } from "../../src/features/wallet/wallet-format";

function TransactionRow({ transaction, kind }) {
    const isDeposit = kind === "deposit";
    const amount = numericUsdt(transaction.amount_usdt);
    return (
        <View style={styles.transaction}>
            <View style={[styles.transactionIcon, isDeposit ? styles.depositIcon : styles.withdrawIcon]}>
                <Ionicons name={isDeposit ? "arrow-down-left" : "arrow-up-right"} size={25} color={isDeposit ? "#08B778" : "#E35368"} />
            </View>
            <View style={styles.transactionBody}>
                <Text style={styles.transactionTitle}>{isDeposit ? "USDT Deposit" : "USDT Withdrawal"}</Text>
                <Text style={styles.transactionMeta}>TRC20 · {transaction.status}</Text>
            </View>
            <View>
                <Text style={[styles.transactionAmount, isDeposit ? styles.depositText : styles.withdrawText]}>{isDeposit ? "+" : "-"}{formatUsdt(amount)} USDT</Text>
                <Text style={styles.transactionInr}>{formatInr(amount)}</Text>
            </View>
        </View>
    );
}

export default function WalletHome() {
    const [summary, setSummary] = useState(null);
    const [error, setError] = useState("");
    const [refreshing, setRefreshing] = useState(false);

    const load = useCallback(async () => {
        setError("");
        try {
            setSummary(await getWalletPaymentSummary());
        } catch (loadError) {
            setError(getUserFacingError(loadError, "Wallet details are unavailable."));
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const onRefresh = async () => {
        setRefreshing(true);
        await load();
        setRefreshing(false);
    };

    const balance = numericUsdt(summary?.availableBalanceUsdt);
    const transactions = [
        ...(summary?.deposits || []).map((item) => ({ ...item, kind: "deposit" })),
        ...(summary?.withdrawals || []).map((item) => ({ ...item, kind: "withdrawal" })),
    ].slice(0, 5);

    return (
        <WalletShell>
            <ScrollView
                contentContainerStyle={styles.scroll}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#08B778" />}
            >
                <LinearGradient colors={["#06B979", "#087B62", "#162137"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.balanceCard}>
                    <Text style={styles.overline}>TOTAL BALANCE</Text>
                    <View style={styles.balanceLine}>
                        <Text style={styles.inrBalance}>{formatInr(balance)}.00</Text>
                        <View style={styles.usdtBlock}>
                            <View style={styles.usdtIcon}><Text style={styles.usdtIconText}>₮</Text></View>
                            <Text style={styles.usdtAmount}>{formatUsdt(balance)}</Text>
                            <Text style={styles.usdtLabel}>USDT</Text>
                        </View>
                    </View>
                    <Text style={styles.rateText}>1 USDT = ₹73.42 · Verified account</Text>
                    <View style={styles.primaryActions}>
                        <TouchableOpacity onPress={() => router.push("/wallet/deposit")} style={styles.addFunds} activeOpacity={0.85}>
                            <Ionicons name="arrow-down-left" size={25} color="#FFFFFF" />
                            <Text style={styles.actionText}>ADD FUNDS</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => router.push("/wallet/withdraw")} style={styles.withdraw} activeOpacity={0.85}>
                            <Ionicons name="arrow-up-right" size={25} color="#FFFFFF" />
                            <Text style={styles.actionText}>WITHDRAW</Text>
                        </TouchableOpacity>
                    </View>
                </LinearGradient>

                <View style={styles.quickActions}>
                    <TouchableOpacity style={styles.quickAction} onPress={() => router.push("/wallet/deposit")}><Ionicons name="qr-code-outline" size={26} color="#08B778" /><Text style={styles.quickText}>Scan QR</Text></TouchableOpacity>
                    <TouchableOpacity style={styles.quickAction} onPress={() => router.push("/wallet/deposit")}><Ionicons name="arrow-down-left" size={26} color="#08B778" /><Text style={styles.quickText}>Deposit</Text></TouchableOpacity>
                    <TouchableOpacity style={styles.quickAction} onPress={() => router.push("/wallet/withdraw")}><Ionicons name="arrow-up-right" size={26} color="#E4A01A" /><Text style={[styles.quickText, { color: "#C88B14" }]}>Withdraw</Text></TouchableOpacity>
                    <TouchableOpacity style={styles.quickAction} onPress={load}><Ionicons name="bar-chart-outline" size={26} color="#695CE0" /><Text style={[styles.quickText, { color: "#695CE0" }]}>History</Text></TouchableOpacity>
                </View>

                <View style={styles.sectionTitle}><Text style={styles.overlineDark}>RECENT TRANSACTIONS</Text><Text style={styles.viewAll}>View All</Text></View>
                {error ? <Text style={styles.error}>{error}</Text> : null}
                {!summary && !error ? <ActivityIndicator color="#08B778" style={styles.loading} /> : null}
                {summary && transactions.length === 0 ? <View style={styles.empty}><Ionicons name="receipt-outline" size={32} color="#90A0B1" /><Text style={styles.emptyText}>No demo transactions yet</Text><Text style={styles.emptyCopy}>Use Add Funds to test a mock USDT deposit.</Text></View> : null}
                {transactions.map((item) => <TransactionRow key={`${item.kind}-${item.id}`} transaction={item} kind={item.kind} />)}
            </ScrollView>
        </WalletShell>
    );
}

const styles = StyleSheet.create({
    scroll: { padding: 24, paddingBottom: 32 },
    balanceCard: { borderRadius: 35, minHeight: 345, overflow: "hidden", padding: 30 },
    overline: { color: "#C9F6E8", fontFamily: "monospace", fontSize: 11, letterSpacing: 4 },
    balanceLine: { flexDirection: "row", justifyContent: "space-between", marginTop: 20 },
    inrBalance: { color: "#FFFFFF", flex: 1, fontSize: 47, fontWeight: "900", letterSpacing: -2 },
    usdtBlock: { alignItems: "center", width: 86 },
    usdtIcon: { alignItems: "center", backgroundColor: "#20A685", borderRadius: 20, height: 80, justifyContent: "center", width: 80 },
    usdtIconText: { color: "#FFFFFF", fontSize: 44, fontWeight: "900" },
    usdtAmount: { color: "#FFFFFF", fontFamily: "monospace", fontSize: 18, fontWeight: "800", marginTop: 8 },
    usdtLabel: { color: "#B4CABF", fontSize: 10, marginTop: 2 },
    rateText: { color: "#B5CABE", fontFamily: "monospace", fontSize: 11, marginTop: 16 },
    primaryActions: { flexDirection: "row", gap: 16, marginTop: 30 },
    addFunds: { alignItems: "center", backgroundColor: "rgba(207,255,240,0.22)", borderColor: "rgba(255,255,255,0.35)", borderRadius: 19, borderWidth: 1, flex: 1, flexDirection: "row", gap: 9, justifyContent: "center", minHeight: 75 },
    withdraw: { alignItems: "center", backgroundColor: "rgba(20,28,46,0.37)", borderColor: "rgba(255,255,255,0.21)", borderRadius: 19, borderWidth: 1, flex: 1, flexDirection: "row", gap: 9, justifyContent: "center", minHeight: 75 },
    actionText: { color: "#FFFFFF", fontSize: 18, fontWeight: "900" },
    quickActions: { flexDirection: "row", gap: 10, marginTop: 24 },
    quickAction: { alignItems: "center", backgroundColor: "#FFFFFF", borderColor: "#E9EDF5", borderRadius: 18, borderWidth: 1, elevation: 2, flex: 1, gap: 10, justifyContent: "center", minHeight: 112, shadowColor: "#8290A2", shadowOpacity: 0.1, shadowRadius: 8 },
    quickText: { color: "#08A878", fontFamily: "monospace", fontSize: 10, fontWeight: "700" },
    sectionTitle: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginTop: 27, marginBottom: 14 },
    overlineDark: { color: "#657187", fontFamily: "monospace", fontSize: 10, letterSpacing: 1.7 },
    viewAll: { color: "#08B778", fontSize: 16, fontWeight: "700" },
    transaction: { alignItems: "center", backgroundColor: "#FFFFFF", borderColor: "#E9EDF5", borderRadius: 19, borderWidth: 1, flexDirection: "row", marginBottom: 13, padding: 16 },
    transactionIcon: { alignItems: "center", borderRadius: 18, height: 60, justifyContent: "center", width: 60 },
    depositIcon: { backgroundColor: "#E7F9F2", borderColor: "#B9ECD9", borderWidth: 1 },
    withdrawIcon: { backgroundColor: "#FFF0F1", borderColor: "#F9D4DA", borderWidth: 1 },
    transactionBody: { flex: 1, marginLeft: 15 },
    transactionTitle: { color: "#172238", fontSize: 17, fontWeight: "800" },
    transactionMeta: { color: "#778297", fontFamily: "monospace", fontSize: 10, marginTop: 6 },
    transactionAmount: { fontFamily: "monospace", fontSize: 13, fontWeight: "800", textAlign: "right" },
    depositText: { color: "#08B778" },
    withdrawText: { color: "#DD5164" },
    transactionInr: { color: "#778297", fontFamily: "monospace", fontSize: 10, marginTop: 5, textAlign: "right" },
    loading: { marginVertical: 35 },
    error: { color: "#D54C62", marginBottom: 15, textAlign: "center" },
    empty: { alignItems: "center", backgroundColor: "#FFFFFF", borderRadius: 18, padding: 25 },
    emptyText: { color: "#273247", fontSize: 16, fontWeight: "800", marginTop: 8 },
    emptyCopy: { color: "#778297", fontSize: 12, marginTop: 5, textAlign: "center" },
});
