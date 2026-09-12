import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, View } from "react-native";
import BrandLogo from "./BrandLogo";

export default function AuthHeader() {
    return (
        <LinearGradient
            colors={["#060D1E", "#0B1528", "#112240"]}
            style={styles.topSection}
        >
            {/* Logo */}
            <BrandLogo size="small" />

            {/* Brand */}
            <Text style={styles.brand}>
                STOCKPE
            </Text>

            <View style={styles.badgePill}>
                <Text style={styles.badgePillText}>CRYPTO INDEX PREDICTIONS</Text>
            </View>

            {/* Stats */}
            <View style={styles.statsContainer}>

                <View style={styles.stat}>
                    <Text style={[styles.statValue, styles.green]}>
                        $50K
                    </Text>

                    <Text style={styles.statLabel}>
                        Daily Pool (₮)
                    </Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.stat}>
                    <Text style={[styles.statValue, styles.blue]}>
                        2.1M+
                    </Text>

                    <Text style={styles.statLabel}>
                        Traders
                    </Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.stat}>
                    <Text style={[styles.statValue, styles.yellow]}>
                        4.8★
                    </Text>

                    <Text style={styles.statLabel}>
                        App Rating
                    </Text>
                </View>

            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    topSection: {
        alignItems: "center",
        paddingTop: 24,
        paddingBottom: 28,
        paddingHorizontal: 20,
    },

    brand: {
        fontSize: 38,
        fontWeight: "900",
        letterSpacing: 6,
        color: "#FFFFFF",
        marginTop: 6,
    },

    badgePill: {
        backgroundColor: "rgba(0, 201, 135, 0.12)",
        borderWidth: 1,
        borderColor: "rgba(0, 201, 135, 0.3)",
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 12,
        marginTop: 4,
    },

    badgePillText: {
        fontSize: 9.5,
        fontWeight: "900",
        letterSpacing: 1.5,
        color: "#00C987",
    },

    statsContainer: {
        flexDirection: "row",
        width: "100%",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 22,
        backgroundColor: "rgba(255, 255, 255, 0.04)",
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.08)",
    },

    stat: {
        alignItems: "center",
        flex: 1,
    },

    divider: {
        width: 1,
        height: 24,
        backgroundColor: "rgba(255, 255, 255, 0.1)",
    },

    statValue: {
        fontSize: 18,
        fontWeight: "900",
    },

    statLabel: {
        color: "#94A3B8",
        fontSize: 10.5,
        fontWeight: "600",
        marginTop: 2,
    },

    green: {
        color: "#00C987",
    },

    blue: {
        color: "#38BDF8",
    },

    yellow: {
        color: "#F59E0B",
    },
});