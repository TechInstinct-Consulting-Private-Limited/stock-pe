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
        height: 65,
        backgroundColor: "#EDF0FA",
        borderRadius: 20,
        flexDirection: "row",
        padding: 5,
        marginBottom: 32,
    },

    tab: {
        flex: 1,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
    },

    activeTab: {
        backgroundColor: "#00C987",

        shadowColor: "#00C987",
        shadowOffset: {
            width: 0,
            height: 5,
        },
        shadowOpacity: 0.25,
        shadowRadius: 10,

        elevation: 5,
    },

    tabText: {
        fontSize: 17,
        fontWeight: "800",
        color: "#6D7890",
    },

    activeTabText: {
        color: "#FFFFFF",
    },
});