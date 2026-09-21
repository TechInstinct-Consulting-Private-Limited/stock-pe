import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

export default function AlternativeAuth() {
    return (
        <>
            {/* OR */}
            <View style={styles.orContainer}>
                <View style={styles.line} />

                <Text style={styles.orText}>
                    OR
                </Text>

                <View style={styles.line} />
            </View>

            {/* USDT WALLET */}
            <TouchableOpacity
                style={styles.walletButton}
                activeOpacity={1}
            >

                <View style={styles.walletIcon}>
                    <Text style={styles.walletIconText}>
                        ₮
                    </Text>
                </View>

                <View style={styles.walletTextContainer}>
                    <Text style={styles.walletTitle}>
                        Continue with USDT Wallet
                    </Text>

                    <Text style={styles.walletSubtitle}>
                        Connect TRC-20 / BEP-20 Web3 wallet
                    </Text>
                </View>

                <Ionicons
                    name="chevron-forward"
                    size={24}
                    color="#657189"
                />

            </TouchableOpacity>
        </>
    );
}

const styles = StyleSheet.create({
    orContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 18,
    },

    line: {
        flex: 1,
        height: 1,
        backgroundColor: "#E2E8F0",
    },

    orText: {
        marginHorizontal: 12,
        color: "#94A3B8",
        fontSize: 11,
        fontWeight: "800",
        letterSpacing: 1,
    },

    walletButton: {
        minHeight: 68,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#E2E8F0",
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 14,
        backgroundColor: "#FFFFFF",
        shadowColor: "#0F172A",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 2,
    },

    walletIcon: {
        width: 42,
        height: 42,
        borderRadius: 12,
        backgroundColor: "#E6FBF3",
        borderWidth: 1,
        borderColor: "#A7F3D0",
        alignItems: "center",
        justifyContent: "center",
    },

    walletIconText: {
        color: "#00C987",
        fontSize: 20,
        fontWeight: "900",
    },

    walletTextContainer: {
        flex: 1,
        marginLeft: 12,
    },

    walletTitle: {
        fontSize: 13.5,
        fontWeight: "800",
        color: "#0F172A",
    },

    walletSubtitle: {
        fontSize: 11,
        fontWeight: "500",
        color: "#64748B",
        marginTop: 2,
    },
});