import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function AuthTabs({ activeTab, onChange }) {
    return (
        <View style={styles.tabs}>

            {/* SIGN IN */}
            <TouchableOpacity
                style={[
                    styles.tab,
                    activeTab === "signin" && styles.activeTab,
                ]}
                onPress={() => onChange("signin")}
            >
                <Text
                    style={[
                        styles.tabText,
                        activeTab === "signin" && styles.activeTabText,
                    ]}
                >
                    SIGN IN
                </Text>
            </TouchableOpacity>

            {/* SIGN UP */}
            <TouchableOpacity
                style={[
                    styles.tab,
                    activeTab === "signup" && styles.activeTab,
                ]}
                onPress={() => onChange("signup")}
            >
                <Text
                    style={[
                        styles.tabText,
                        activeTab === "signup" && styles.activeTabText,
                    ]}
                >
                    SIGN UP
                </Text>
            </TouchableOpacity>

        </View>
    );
}

const styles = StyleSheet.create({
    tabs: {
        height: 52,
        backgroundColor: "#F1F5F9",
        borderRadius: 16,
        flexDirection: "row",
        padding: 4,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },

    tab: {
        flex: 1,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
    },

    activeTab: {
        backgroundColor: "#00C987",
        shadowColor: "#00C987",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.25,
        shadowRadius: 6,
        elevation: 3,
    },

    tabText: {
        fontSize: 14,
        fontWeight: "800",
        letterSpacing: 0.8,
        color: "#64748B",
    },

    activeTabText: {
        color: "#FFFFFF",
        fontWeight: "900",
    },
});