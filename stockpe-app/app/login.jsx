import { useRef, useState } from "react";

import {
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
        <SafeAreaView edges={["top", "bottom", "left", "right"]} style={styles.container}>

            {/* ========================================
                FIXED BRAND / HEADER
                ======================================== */}

            <AuthHeader />


            {/* ========================================
                ONLY FORM AREA HANDLES KEYBOARD
                ======================================== */}

            <KeyboardAvoidingView
                style={styles.formContainer}
                behavior={
                    Platform.OS === "ios"
                        ? "padding"
                        : "height"
                }
            >

                {/* ====================================
                    WHITE SCROLLABLE AREA
                    ==================================== */}

                <View style={styles.formSheet}>

                    <ScrollView
                        ref={scrollRef}

                        style={styles.scrollView}

                        contentContainerStyle={
                            styles.scrollContent
                        }

                        showsVerticalScrollIndicator={false}

                        keyboardShouldPersistTaps="handled"

                        keyboardDismissMode={
                            Platform.OS === "ios"
                                ? "interactive"
                                : "on-drag"
                        }

                        automaticallyAdjustKeyboardInsets={
                            Platform.OS === "ios"
                        }
                    >

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

                    </ScrollView>

                </View>

            </KeyboardAvoidingView>

        </SafeAreaView>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#060D1E",
    },

    formContainer: {
        flex: 1,
    },

    formSheet: {
        flex: 1,
        backgroundColor: "#FFFFFF",
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        overflow: "hidden",
    },

    scrollView: {
        flex: 1,
    },

    scrollContent: {
        flexGrow: 1,
        paddingBottom: 30,
    },

    loginSection: {
        backgroundColor: "#FFFFFF",
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 30,
    },
});