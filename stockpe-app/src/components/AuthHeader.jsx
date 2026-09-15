import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, View } from "react-native";
import BrandLogo from "./BrandLogo";

export default function AuthHeader() {
    return (
        <LinearGradient
            colors={["#FFFFFF", "#F8FAFC", "#F1F5F9"]}
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
        paddingTop: 20,
        paddingBottom: 24,
        paddingHorizontal: 20,
    },

    brand: {
        fontSize: 34,
        fontWeight: "900",
        letterSpacing: 5,
        color: "#0F172A",
        marginTop: 6,
    },

    badgePill: {
        backgroundColor: "#E6FBF3",
        borderWidth: 1,
        borderColor: "#A7F3D0",
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 12,
        marginTop: 4,
    },

    badgePillText: {
        fontSize: 9.5,
        fontWeight: "900",
        letterSpacing: 1.5,
        color: "#059669",
    },

    statsContainer: {
        flexDirection: "row",
        width: "100%",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 18,
        backgroundColor: "#FFFFFF",
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#E2E8F0",
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 2,
    },

    stat: {
        alignItems: "center",
        flex: 1,
    },

    divider: {
        width: 1,
        height: 24,
        backgroundColor: "#E2E8F0",
    },

    statValue: {
        fontSize: 18,
        fontWeight: "900",
    },

    statLabel: {
        color: "#64748B",
        fontSize: 10.5,
        fontWeight: "600",
        marginTop: 2,
    },

    green: {
        color: "#059669",
    },

    blue: {
        color: "#0284C7",
    },

    yellow: {
        color: "#D97706",
    },
});