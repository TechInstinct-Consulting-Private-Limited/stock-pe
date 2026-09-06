import { useRef, useState } from "react";

import {
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    View,
} from "react-native";

import AlternativeAuth from "./components/AlternativeAuth";
import AuthForm from "./components/AuthForm";
import AuthHeader from "./components/AuthHeader.jsx";
import AuthTabs from "./components/AuthTabs";

export default function Login() {

    const [activeTab, setActiveTab] = useState("signin");

    const [mobile, setMobile] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] =
        useState(false);

    const [agreeTerms, setAgreeTerms] = useState(false);

    const scrollRef = useRef(null);


    // ============================================
    // SIGN IN <-> SIGN UP
    // ============================================

    const switchTab = (tab) => {

        // Close keyboard
        Keyboard.dismiss();

        // Change tab
        setActiveTab(tab);

        // Clear all form values
        setMobile("");
        setPassword("");
        setConfirmPassword("");

        // Reset password visibility
        setShowPassword(false);
        setShowConfirmPassword(false);

        // Reset terms checkbox
        setAgreeTerms(false);

        // Scroll form back to top
        requestAnimationFrame(() => {
            scrollRef.current?.scrollTo({
                y: 0,
                animated: false,
            });
        });
    };


    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                style={styles.keyboardContainer}
                behavior={
                    Platform.OS === "ios"
                        ? "padding"
                        : "height"
                }
            >
                <ScrollView
                    ref={scrollRef}
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    keyboardDismissMode={
                        Platform.OS === "ios"
                            ? "interactive"
                            : "on-drag"
                    }
                >
                    <AuthHeader />

                    <View style={styles.formSheet}>
                        <View style={styles.sheetHandle} />

                        {/* =================================
                            AUTH CONTENT
                            ================================= */}

                        <View style={styles.loginSection}>

                            {/* SIGN IN / SIGN UP TABS */}

                            <AuthTabs
                                activeTab={activeTab}
                                onChange={switchTab}
                            />


                            {/* SIGN IN / SIGN UP FORM */}

                            <AuthForm
                                key={activeTab}
                                activeTab={activeTab}

                                mobile={mobile}
                                setMobile={setMobile}

                                password={password}
                                setPassword={setPassword}

                                confirmPassword={
                                    confirmPassword
                                }

                                setConfirmPassword={
                                    setConfirmPassword
                                }

                                showPassword={
                                    showPassword
                                }

                                setShowPassword={
                                    setShowPassword
                                }

                                showConfirmPassword={
                                    showConfirmPassword
                                }

                                setShowConfirmPassword={
                                    setShowConfirmPassword
                                }

                                agreeTerms={
                                    agreeTerms
                                }

                                setAgreeTerms={
                                    setAgreeTerms
                                }
                            />


                            {/* =================================
                                ALWAYS VISIBLE

                                Sign In + Sign Up
                                BOTH screens
                                ================================= */}

                            <AlternativeAuth />

                        </View>

                    </View>
                </ScrollView>

            </KeyboardAvoidingView>

        </SafeAreaView>
    );
}


const styles = StyleSheet.create({

    // ============================================
    // MAIN SCREEN
    // ============================================

    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },


    // ============================================
    // KEYBOARD-AWARE SCREEN
    // ============================================

    keyboardContainer: {
        flex: 1,
    },


    // ============================================
    // WHITE SHEET
    // ============================================

    formSheet: {
        flex: 1,

        backgroundColor: "#FFFFFF",

        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        marginTop: -30,
        paddingTop: 15,

        overflow: "hidden",
    },

    sheetHandle: {
        width: 38,
        height: 4,
        borderRadius: 2,
        backgroundColor: "#F0F1F3",
        alignSelf: "center",
    },


    // ============================================
    // SCROLL VIEW
    // ============================================

    scrollView: {
        flex: 1,
    },


    // ============================================
    // SCROLL CONTENT
    // ============================================

    scrollContent: {
        flexGrow: 1,

        paddingBottom: 40,
    },


    // ============================================
    // AUTH CONTENT
    // ============================================

    loginSection: {
        backgroundColor: "#FFFFFF",

        paddingHorizontal: 24,

        paddingTop: 24,

        paddingBottom: 35,
    },

});
