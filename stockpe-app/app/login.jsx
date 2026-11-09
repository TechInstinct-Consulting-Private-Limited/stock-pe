import Constants from "expo-constants";
import { router } from "expo-router";
import { useRef, useState } from "react";

import {
    Alert,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AlternativeAuth from "../src/components/AlternativeAuth";
import AuthForm from "../src/components/AuthForm";
import AuthHeader from "../src/components/AuthHeader.jsx";
import AuthTabs from "../src/components/AuthTabs";
import {
    authenticateWithMsg91,
    getOnboardingStatus,
    getUserFacingError,
    signIn,
    signUp,
} from "../src/services/api";
import { setAuthToken } from "../src/services/authStorage";
import { MSG91_TOKEN_AUTH, MSG91_WIDGET_ID } from "../src/services/msg91";

// MSG91's widget is a native module. Expo Go does not include that module,
// so keep the existing backend OTP route available for local Expo Go testing.
const isExpoGo = Constants.appOwnership === "expo"
    || Constants.executionEnvironment === "storeClient";
const DefaultWidget = isExpoGo
    ? null
    : require("@msg91comm/sendotp-react-native").DefaultWidget;

export default function Login() {

    const [activeTab, setActiveTab] = useState("signin");

    const [mobile, setMobile] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] =
        useState(false);

    const [agreeTerms, setAgreeTerms] = useState(false);

    // MSG91 OTP widget: handles the full send + verify flow in a modal.
    const [showMsg91Widget, setShowMsg91Widget] = useState(false);

    const scrollRef = useRef(null);


    // ============================================
    // MSG91 OTP WIDGET
    // ============================================

    const openMsg91Widget = () => {
        Keyboard.dismiss();

        if (isExpoGo) {
            requestBackendOtp();
            return;
        }

        setShowMsg91Widget(true);
    };

    const requestBackendOtp = async () => {
        try {
            const requestOtp = activeTab === "signup" ? signUp : signIn;
            await requestOtp(mobile, password);
            router.push({
                pathname: "/otp",
                params: { mobile, mode: activeTab },
            });
        } catch (error) {
            Alert.alert("Unable to continue", getUserFacingError(error));
        }
    };

    const handleMsg91Completion = async (result) => {
        setShowMsg91Widget(false);

        // result.success === true on verified OTP.
        // result.message holds the access token, result.identifier the number.
        if (result?.success) {
            const rawMobile = String(result.identifier || mobile || "");
            const cleanMobile = rawMobile.replace(/\D/g, "").slice(-10);

            try {
                const authData = await authenticateWithMsg91(
                    cleanMobile,
                    activeTab,
                    password,
                    result.message
                );
                if (!authData?.token) {
                    throw new Error("Could not create your secure session. Please try again.");
                }

                await setAuthToken(authData.token);

                // Route from the authenticated onboarding state rather than
                // returning users through the legacy Aadhaar OTP screens.
                const onboarding = await getOnboardingStatus();

                if (onboarding?.onboardingCompleted) {
                    router.replace("/(tabs)/events");
                    return;
                }

                if (onboarding?.aadhaarKyc?.completed) {
                    router.replace({
                        pathname: "/usdt-wallet",
                        params: {
                            mobile: cleanMobile,
                            mode: activeTab === "signup" ? "signup" : "signin",
                            verified: "1",
                        },
                    });
                    return;
                }

                router.replace({
                    pathname: "/digilocker-kyc",
                    params: {
                        mobile: cleanMobile,
                        mode: activeTab === "signup" ? "signup" : "signin",
                    },
                });
            } catch (err) {
                console.warn("MSG91 onboarding routing failed:", err?.message || err);
                Alert.alert("Unable to continue", getUserFacingError(err));
            }
        }
    };


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

                                onRequestOtp={openMsg91Widget}

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

            {/* ========================================
                MSG91 OTP WIDGET (drop-in modal)
                ======================================== */}

            {DefaultWidget ? (
                <DefaultWidget
                    visible={showMsg91Widget}
                    onClose={() => setShowMsg91Widget(false)}
                    onCompletion={handleMsg91Completion}
                    widgetId={MSG91_WIDGET_ID}
                    tokenAuth={MSG91_TOKEN_AUTH}
                    theme="light"
                    primaryColor="#00C987"
                />
            ) : null}

        </SafeAreaView>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
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
