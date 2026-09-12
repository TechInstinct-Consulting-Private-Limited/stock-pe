import { Ionicons } from "@expo/vector-icons";
import QRCode from "react-native-qrcode-svg";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { getUserFacingError, getUsdtWallet } from "../../src/services/api";
import WalletShell from "../../src/features/wallet/WalletShell";
import { formatUsdt, shortenAddress } from "../../src/features/wallet/wallet-format";

export default function WithdrawDestinationScreen() {
    const { amount } = useLocalSearchParams();
    const [wallet, setWallet] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const amountValue = String(amount || "0");

    const load = useCallback(async () => {
        try { const result = await getUsdtWallet(); setWallet(result.wallet); }
        catch (loadError) { setError(getUserFacingError(loadError, "Linked wallet is unavailable.")); }
        finally { setLoading(false); }
    }, []);
    useEffect(() => { load(); }, [load]);

    return <WalletShell><ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.pageTitle}><TouchableOpacity onPress={() => router.back()} style={styles.back}><Ionicons name="chevron-back" size={25} color="#718095" /></TouchableOpacity><View><Text style={styles.title}>Withdraw USDT</Text><Text style={styles.subtitle}>Destination wallet</Text></View><Text style={styles.step}>2/3</Text></View><View style={[styles.progress, { width: "67%" }]} />
        {loading ? <ActivityIndicator color="#08B778" style={styles.loading} /> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {wallet ? <>
            <View style={styles.amountBanner}><View style={styles.trc}><Text style={styles.trcText}>TRC20</Text></View><View><Text style={styles.bannerAmount}>{formatUsdt(amountValue)} USDT received</Text><Text style={styles.bannerMeta}>Demo fee: 0 USDT · Instant mock confirmation</Text></View></View>
            <Text style={styles.label}>DESTINATION ADDRESS</Text><View style={styles.addressBox}><Text style={styles.address}>{wallet.address}</Text></View>
            <View style={styles.qrCard}><View style={styles.qrHeading}><Text style={styles.label}>LINKED WALLET QR</Text><Text style={styles.copy}>READ-ONLY</Text></View><View style={styles.qrBody}><View style={styles.qrBox}><QRCode value={wallet.address} size={112} /></View><Text style={styles.qrAddress}>{shortenAddress(wallet.address)}</Text></View></View>
            <View style={styles.warning}><Ionicons name="information-circle-outline" size={20} color="#D75061" /><Text style={styles.warningText}>This is your verified linked TRC20 wallet. In production, wallet changes need a separate secure flow.</Text></View>
            <TouchableOpacity onPress={() => router.push({ pathname: "/wallet/withdraw-review", params: { amount: amountValue, destination: wallet.address } })} style={styles.review}><Text style={styles.reviewText}>REVIEW TRANSFER</Text><Ionicons name="arrow-forward" size={27} color="#FFFFFF" /></TouchableOpacity>
        </> : null}
    </ScrollView></WalletShell>;
}

const styles = StyleSheet.create({
    scroll: { paddingBottom: 32 }, pageTitle: { alignItems: "center", backgroundColor: "#FFFFFF", flexDirection: "row", minHeight: 100, paddingHorizontal: 24 }, back: { alignItems: "center", backgroundColor: "#F0F4FC", borderRadius: 19, height: 50, justifyContent: "center", marginRight: 17, width: 50 }, title: { color: "#142039", fontSize: 25, fontWeight: "900" }, subtitle: { color: "#7B8799", fontFamily: "monospace", fontSize: 11, marginTop: 3 }, step: { backgroundColor: "#F0F4FC", borderRadius: 16, color: "#657187", fontFamily: "monospace", fontSize: 12, marginLeft: "auto", paddingHorizontal: 13, paddingVertical: 8 }, progress: { backgroundColor: "#08B778", height: 3 }, loading: { marginTop: 70 }, error: { color: "#D54C62", margin: 24, textAlign: "center" },
    amountBanner: { alignItems: "center", backgroundColor: "#EAF8FB", borderColor: "#B5E5E1", borderRadius: 22, borderWidth: 1, flexDirection: "row", gap: 15, margin: 24, padding: 20 }, trc: { alignItems: "center", backgroundColor: "#C9F3E8", borderRadius: 13, height: 55, justifyContent: "center", width: 64 }, trcText: { color: "#08A878", fontSize: 14, fontWeight: "900" }, bannerAmount: { color: "#202B40", fontSize: 17, fontWeight: "800" }, bannerMeta: { color: "#788497", fontFamily: "monospace", fontSize: 10, marginTop: 5 }, label: { color: "#6C788B", fontFamily: "monospace", fontSize: 10, letterSpacing: 1.5 }, addressBox: { backgroundColor: "#FFFFFF", borderRadius: 18, margin: 14, marginHorizontal: 24, minHeight: 104, padding: 23 }, address: { color: "#1E2A40", fontFamily: "monospace", fontSize: 15, lineHeight: 25 },
    qrCard: { backgroundColor: "#FFFFFF", borderRadius: 20, margin: 24, marginTop: 22, padding: 21 }, qrHeading: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" }, copy: { borderColor: "#E4E9F1", borderRadius: 14, borderWidth: 1, color: "#718096", fontFamily: "monospace", fontSize: 9, paddingHorizontal: 10, paddingVertical: 6 }, qrBody: { alignItems: "center", flexDirection: "row", marginTop: 18 }, qrBox: { backgroundColor: "#FFFFFF", borderRadius: 15, elevation: 3, padding: 10 }, qrAddress: { color: "#273247", flex: 1, fontFamily: "monospace", fontSize: 14, lineHeight: 22, marginLeft: 19 },
    warning: { alignItems: "center", backgroundColor: "#FFF3F3", borderColor: "#F6CDD2", borderRadius: 15, borderWidth: 1, flexDirection: "row", gap: 11, marginHorizontal: 24, padding: 15 }, warningText: { color: "#7A7078", flex: 1, fontSize: 12, lineHeight: 17 }, review: { alignItems: "center", backgroundColor: "#08B778", borderRadius: 19, flexDirection: "row", gap: 13, justifyContent: "center", margin: 24, minHeight: 67 }, reviewText: { color: "#FFFFFF", fontSize: 19, fontWeight: "900" },
});
