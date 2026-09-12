import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getWalletPaymentSummary } from "../../services/api";
import { formatInr, formatUsdt } from "./wallet-format";

const tickerItems = [
    ["SENSEX", "79,432.18", "↘ 0.31%", "down"],
    ["BANK NIFTY", "51,843.25", "↗ 1.12%", "up"],
    ["NIFTY 50", "24,187.65", "↗ 0.84%", "up"],
];

export default function WalletShell({ children, active = "wallet" }) {
    const translateX = useRef(new Animated.Value(0)).current;
    const [headerBalance, setHeaderBalance] = useState(null);

    useEffect(() => {
        const loop = Animated.loop(
            Animated.timing(translateX, {
                toValue: -420,
                duration: 13000,
                useNativeDriver: true,
            })
        );
        loop.start();
        return () => loop.stop();
    }, [translateX]);

    useEffect(() => {
        let mounted = true;
        getWalletPaymentSummary()
            .then((summary) => mounted && setHeaderBalance(summary.availableBalanceUsdt))
            .catch(() => mounted && setHeaderBalance(null));
        return () => { mounted = false; };
    }, []);

    const navItems = [
        ["events", "home-outline", "EVENTS"],
        ["contests", "game-controller-outline", "CONTESTS"],
        ["leaders", "trophy-outline", "LEADERS"],
        ["wallet", "wallet-outline", "WALLET"],
        ["profile", "person-outline", "PROFILE"],
    ];

    return (
        <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
            <View style={styles.header}>
                <View style={styles.brandIcon}><Ionicons name="trending-up" size={25} color="#FFFFFF" /></View>
                <Text style={styles.title}>My Wallet</Text>
                <View style={styles.headerSpacer} />
                <View style={styles.balanceChip}><Text style={styles.chipCoin}>₮</Text><Text style={styles.chipText}>{headerBalance === null ? "USDT" : formatUsdt(headerBalance)}</Text></View>
                {headerBalance !== null ? <View style={styles.inrChip}><Text style={styles.inrChipText}>{formatInr(headerBalance)}</Text></View> : null}
                <TouchableOpacity accessibilityLabel="Notifications" style={styles.bell}><Ionicons name="notifications-outline" size={24} color="#647285" /></TouchableOpacity>
            </View>

            <View style={styles.tickerClip}>
                <Animated.View style={[styles.tickerRow, { transform: [{ translateX }] }]}>
                    {[...tickerItems, ...tickerItems].map(([name, value, move, tone], index) => (
                        <View style={styles.tickerItem} key={`${name}-${index}`}>
                            <Text style={styles.tickerName}>{name}</Text>
                            <Text style={styles.tickerValue}>{value}</Text>
                            <Text style={tone === "up" ? styles.up : styles.down}>{move}</Text>
                        </View>
                    ))}
                </Animated.View>
            </View>

            <View style={styles.content}>{children}</View>

            <View style={styles.bottomNav}>
                {navItems.map(([key, icon, label]) => {
                    const selected = active === key;
                    return (
                        <TouchableOpacity
                            key={key}
                            accessibilityLabel={label}
                            accessibilityState={{ selected }}
                            onPress={() => key === "wallet" && router.replace("/wallet")}
                            style={styles.navItem}
                        >
                            {selected && <View style={styles.activeLine} />}
                            <Ionicons name={icon} size={24} color={selected ? "#08B778" : "#8792A1"} />
                            <Text style={[styles.navLabel, selected && styles.navLabelActive]}>{label}</Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { backgroundColor: "#F4F7FF", flex: 1 },
    header: { alignItems: "center", backgroundColor: "#FFFFFF", flexDirection: "row", minHeight: 80, paddingHorizontal: 24 },
    brandIcon: { alignItems: "center", backgroundColor: "#08B778", borderRadius: 14, elevation: 5, height: 48, justifyContent: "center", shadowColor: "#08B778", shadowOpacity: 0.25, shadowRadius: 9, width: 48 },
    title: { color: "#111D32", fontSize: 28, fontWeight: "900", letterSpacing: -0.7, marginLeft: 13 },
    headerSpacer: { flex: 1 },
    balanceChip: { alignItems: "center", backgroundColor: "#ECFBF5", borderColor: "#BDEADD", borderRadius: 19, borderWidth: 1, flexDirection: "row", gap: 5, paddingHorizontal: 10, paddingVertical: 8 },
    chipCoin: { color: "#08B778", fontSize: 16, fontWeight: "900" },
    chipText: { color: "#168C6C", fontSize: 10, fontWeight: "800" },
    inrChip: { backgroundColor: "#F1F4FE", borderRadius: 19, marginLeft: 7, paddingHorizontal: 10, paddingVertical: 8 },
    inrChipText: { color: "#354158", fontFamily: "monospace", fontSize: 10, fontWeight: "800" },
    bell: { marginLeft: 10 },
    tickerClip: { backgroundColor: "#FFFFFF", borderTopColor: "#EEF0F5", borderTopWidth: 1, height: 36, overflow: "hidden" },
    tickerRow: { alignItems: "center", flexDirection: "row", height: 36, width: 900 },
    tickerItem: { alignItems: "center", borderRightColor: "#EEF0F5", borderRightWidth: 1, flexDirection: "row", gap: 7, height: 36, paddingHorizontal: 16 },
    tickerName: { color: "#637084", fontSize: 10, fontWeight: "800", letterSpacing: 0.4 },
    tickerValue: { color: "#263246", fontFamily: "monospace", fontSize: 10 },
    up: { color: "#08B778", fontFamily: "monospace", fontSize: 10 },
    down: { color: "#E34B61", fontFamily: "monospace", fontSize: 10 },
    content: { flex: 1 },
    bottomNav: { backgroundColor: "#FFFFFF", borderTopColor: "#EDF0F5", borderTopWidth: 1, flexDirection: "row", height: 80, justifyContent: "space-around" },
    navItem: { alignItems: "center", flex: 1, justifyContent: "center", paddingTop: 8 },
    activeLine: { backgroundColor: "#08B778", borderRadius: 2, height: 3, position: "absolute", top: 0, width: 48 },
    navLabel: { color: "#8792A1", fontSize: 9, fontWeight: "800", letterSpacing: 1, marginTop: 6 },
    navLabelActive: { color: "#08A878" },
});
