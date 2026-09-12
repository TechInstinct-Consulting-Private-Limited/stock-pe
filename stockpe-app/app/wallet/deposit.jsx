import { Ionicons } from "@expo/vector-icons";
import QRCode from "react-native-qrcode-svg";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { createMockDepositAddress, getUserFacingError, getWalletPaymentSummary, simulateMockDeposit } from "../../src/services/api";
import WalletShell from "../../src/features/wallet/WalletShell";
import { shortenAddress } from "../../src/features/wallet/wallet-format";

export default function DepositScreen() {
    const [address, setAddress] = useState("");
    const [deposit, setDeposit] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const load = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            let summary = await getWalletPaymentSummary();
            let nextAddress = summary.depositAddress?.address;
            if (!nextAddress) {
                const created = await createMockDepositAddress();
                nextAddress = created.depositAddress.address;
                summary = await getWalletPaymentSummary();
            }
            setAddress(nextAddress);
            setDeposit(summary.deposits?.[0] || null);
        } catch (loadError) {
            setError(getUserFacingError(loadError, "Demo deposit is unavailable."));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const simulateDeposit = async () => {
        setSubmitting(true);
        setError("");
        try {
            const result = await simulateMockDeposit("10.00");
            setDeposit(result.deposit);
        } catch (depositError) {
            setError(getUserFacingError(depositError, "The demo deposit could not be completed."));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <WalletShell>
            <ScrollView contentContainerStyle={styles.scroll}>
                <View style={styles.pageTitle}><TouchableOpacity onPress={() => router.back()} style={styles.back}><Ionicons name="chevron-back" size={25} color="#718095" /></TouchableOpacity><View><Text style={styles.title}>Deposit USDT</Text><Text style={styles.subtitle}>Secure · Instant · Demo only</Text></View><View style={styles.demoBadge}><View style={styles.dot} /><Text style={styles.demoText}>DEMO</Text></View></View>
                <View style={styles.progress} />

                {loading ? <ActivityIndicator color="#08B778" size="large" style={styles.loading} /> : null}
                {error ? <Text style={styles.error}>{error}</Text> : null}
                {address ? <>
                    <View style={styles.qrCard}>
                        <View style={styles.qrBox}><QRCode value={address} size={170} /></View>
                        <View style={styles.coinBadge}><Text style={styles.coinBadgeText}>₮</Text></View>
                        <View style={styles.addressBox}><Text style={styles.addressLabel}>DEMO DEPOSIT ADDRESS (TRC20)</Text><Text style={styles.addressText}>{shortenAddress(address)}</Text></View>
                    </View>
                    <Text style={styles.label}>SELECT NETWORK</Text>
                    <View style={styles.network}><Text style={styles.networkName}>TRC20</Text><Text style={styles.networkTime}>Mock confirmation</Text></View>
                    <View style={styles.warning}><Ionicons name="information-circle-outline" size={21} color="#D39A16" /><Text style={styles.warningText}>Demo mode only. This address is not on TRON and cannot receive real USDT.</Text></View>
                    <View style={styles.statusCard}>
                        <Text style={styles.statusHeading}>DEPOSIT STATUS</Text>
                        {["Awaiting transaction", "Mock confirmation", "Credited to wallet"].map((label, index) => {
                            const complete = Boolean(deposit);
                            return <View style={styles.statusRow} key={label}><Ionicons name={complete || index === 0 ? "checkmark-circle" : "ellipse-outline"} size={28} color={complete || index === 0 ? "#08B778" : "#AAB4C1"} /><Text style={styles.statusText}>{label}</Text>{complete && <Ionicons name="checkmark" size={20} color="#08B778" />}</View>;
                        })}
                    </View>
                    {deposit ? <TouchableOpacity onPress={() => router.replace("/wallet")} style={styles.confirmed}><Ionicons name="checkmark-circle-outline" size={25} color="#08B778" /><Text style={styles.confirmedText}>DEPOSIT CONFIRMED · VIEW WALLET</Text></TouchableOpacity> : <TouchableOpacity disabled={submitting} onPress={simulateDeposit} style={[styles.simulate, submitting && styles.disabled]}><Text style={styles.simulateText}>{submitting ? "CONFIRMING DEMO…" : "SIMULATE 10 USDT DEPOSIT"}</Text><Ionicons name="arrow-forward" size={25} color="#FFFFFF" /></TouchableOpacity>}
                </> : null}
            </ScrollView>
        </WalletShell>
    );
}

const styles = StyleSheet.create({
    scroll: { paddingBottom: 32 },
    pageTitle: { alignItems: "center", backgroundColor: "#FFFFFF", flexDirection: "row", minHeight: 100, paddingHorizontal: 24 },
    back: { alignItems: "center", backgroundColor: "#F0F4FC", borderRadius: 19, height: 50, justifyContent: "center", marginRight: 17, width: 50 },
    title: { color: "#142039", fontSize: 25, fontWeight: "900" }, subtitle: { color: "#7B8799", fontFamily: "monospace", fontSize: 11, marginTop: 3 },
    demoBadge: { alignItems: "center", backgroundColor: "#EAFBF5", borderColor: "#B8EBD9", borderRadius: 15, borderWidth: 1, flexDirection: "row", gap: 6, marginLeft: "auto", paddingHorizontal: 10, paddingVertical: 7 },
    dot: { backgroundColor: "#08B778", borderRadius: 5, height: 8, width: 8 }, demoText: { color: "#08A878", fontFamily: "monospace", fontSize: 10, fontWeight: "800" },
    progress: { backgroundColor: "#08B778", height: 3, width: "100%" }, loading: { marginTop: 60 }, error: { color: "#D84D62", margin: 24, textAlign: "center" },
    qrCard: { alignItems: "center", backgroundColor: "#E7F7FA", borderColor: "#B3E1DF", borderRadius: 28, borderWidth: 1, margin: 24, paddingBottom: 28, paddingTop: 20 },
    qrBox: { backgroundColor: "#FFFFFF", borderRadius: 20, elevation: 3, padding: 17, shadowColor: "#596C7E", shadowOpacity: 0.18, shadowRadius: 10 }, coinBadge: { alignItems: "center", backgroundColor: "#08A878", borderColor: "#FFFFFF", borderRadius: 23, borderWidth: 4, height: 46, justifyContent: "center", marginTop: -13, width: 46 }, coinBadgeText: { color: "#FFFFFF", fontSize: 25, fontWeight: "900" },
    addressBox: { alignSelf: "stretch", backgroundColor: "#FFFFFF", borderRadius: 15, marginHorizontal: 22, marginTop: 15, padding: 17 }, addressLabel: { color: "#758196", fontFamily: "monospace", fontSize: 9, letterSpacing: 1 }, addressText: { color: "#202B40", fontFamily: "monospace", fontSize: 14, marginTop: 8 },
    label: { color: "#69758A", fontFamily: "monospace", fontSize: 10, letterSpacing: 1.5, marginLeft: 24, marginTop: 3 }, network: { alignItems: "center", backgroundColor: "#E5F7F4", borderColor: "#8DD9CD", borderRadius: 17, borderWidth: 1, margin: 12, marginLeft: 24, padding: 15, width: 180 }, networkName: { color: "#08A878", fontSize: 18, fontWeight: "800" }, networkTime: { color: "#708092", fontFamily: "monospace", fontSize: 10, marginTop: 3 },
    warning: { alignItems: "center", backgroundColor: "#FFFBE9", borderColor: "#F2DEA2", borderRadius: 15, borderWidth: 1, flexDirection: "row", gap: 12, marginHorizontal: 24, marginTop: 12, padding: 17 }, warningText: { color: "#797067", flex: 1, fontSize: 12, lineHeight: 18 },
    statusCard: { backgroundColor: "#FFFFFF", borderRadius: 20, margin: 24, marginBottom: 14, overflow: "hidden" }, statusHeading: { borderBottomColor: "#ECF0F4", borderBottomWidth: 1, color: "#6C788B", fontFamily: "monospace", fontSize: 10, letterSpacing: 1.5, padding: 19 }, statusRow: { alignItems: "center", flexDirection: "row", minHeight: 62, paddingHorizontal: 23 }, statusText: { color: "#273247", flex: 1, fontSize: 17, marginLeft: 17 },
    simulate: { alignItems: "center", backgroundColor: "#08B778", borderRadius: 19, flexDirection: "row", gap: 13, justifyContent: "center", marginHorizontal: 24, minHeight: 66 }, disabled: { opacity: 0.55 }, simulateText: { color: "#FFFFFF", fontSize: 17, fontWeight: "900" }, confirmed: { alignItems: "center", backgroundColor: "#E4F8F3", borderColor: "#86D8C7", borderRadius: 19, borderWidth: 1, flexDirection: "row", gap: 11, justifyContent: "center", marginHorizontal: 24, minHeight: 66 }, confirmedText: { color: "#08A878", fontSize: 15, fontWeight: "900" },
});
