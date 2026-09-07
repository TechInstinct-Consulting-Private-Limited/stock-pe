import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, View } from "react-native";

import BrandLogo from "./BrandLogo";

export default function AuthHeader() {
    return (
        <LinearGradient
            colors={["#071B2D", "#10264D", "#1B3565"]}
            style={styles.topSection}
        >
            {/* Logo */}
            <BrandLogo size="small" />

            {/* Brand */}
            <Text style={styles.brand}>
                STOCKPE
            </Text>

            <Text style={styles.subtitle}>
                India's #1 Stock Prediction Market
            </Text>

            {/* Stats */}
            <View style={styles.statsContainer}>

                <View style={styles.stat}>
                    <Text style={[styles.statValue, styles.green]}>
                        ₹49.5L
                    </Text>

                    <Text style={styles.statLabel}>
                        Prize Pool
                    </Text>
                </View>

                <View style={styles.stat}>
                    <Text style={[styles.statValue, styles.blue]}>
                        2.1M+
                    </Text>

                    <Text style={styles.statLabel}>
                        Players
                    </Text>
                </View>

                <View style={styles.stat}>
                    <Text style={[styles.statValue, styles.yellow]}>
                        4.8★
                    </Text>

                    <Text style={styles.statLabel}>
                        Rating
                    </Text>
                </View>

            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    topSection: {
        minHeight: 355,
        alignItems: "center",
        paddingTop: 28,
        paddingBottom: 28,
    },

    brand: {
        fontSize: 46,
        fontWeight: "900",
        letterSpacing: 7,
        color: "#FFFFFF",
    },

    subtitle: {
        fontSize: 14,
        color: "#8995AA",
        marginTop: 5,
    },

    statsContainer: {
        flexDirection: "row",
        width: "92%",
        justifyContent: "space-between",
        marginTop: 28,
    },

    stat: {
        alignItems: "center",
        flex: 1,
    },

    statValue: {
        fontSize: 24,
        fontWeight: "800",
    },

    statLabel: {
        color: "#8993A8",
        fontSize: 13,
        marginTop: 4,
    },

    green: {
        color: "#00C987",
    },

    blue: {
        color: "#8494FF",
    },

    yellow: {
        color: "#F5C33B",
    },
});