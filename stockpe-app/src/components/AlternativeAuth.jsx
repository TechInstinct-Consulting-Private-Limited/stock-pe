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
            <TouchableOpacity style={styles.walletButton}>

                <View style={styles.walletIcon}>
                    <Text style={styles.walletIconText}>
                        ₹
                    </Text>
                </View>

                <View style={styles.walletTextContainer}>
                    <Text style={styles.walletTitle}>
                        Continue with USDT Wallet
                    </Text>

                    <Text style={styles.walletSubtitle}>
                        Connect your crypto wallet
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
        marginVertical: 22,
    },

    line: {
        flex: 1,
        height: 1,
        backgroundColor: "#E5E7EE",
    },

    orText: {
        marginHorizontal: 14,
        color: "#7D8493",
        fontSize: 12,
    },

    walletButton: {
        minHeight: 80,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "#E5E5E5",

        flexDirection: "row",
        alignItems: "center",

        paddingHorizontal: 15,

        backgroundColor: "#FFFFFF",

        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.06,
        shadowRadius: 5,

        elevation: 2,
    },

    walletIcon: {
        width: 50,
        height: 50,
        borderRadius: 15,

        backgroundColor: "#29A27F",

        alignItems: "center",
        justifyContent: "center",
    },

    walletIconText: {
        color: "#FFFFFF",
        fontSize: 24,
        fontWeight: "bold",
    },

    walletTextContainer: {
        flex: 1,
        marginLeft: 15,
    },

    walletTitle: {
        fontSize: 17,
        fontWeight: "600",
        color: "#10192C",
    },

    walletSubtitle: {
        fontSize: 13,
        color: "#747D8E",
        marginTop: 3,
    },
});