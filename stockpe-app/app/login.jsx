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
    getUserFacingError,
    prepareMsg91Otp,
    signIn,
    signUp,
} from "../src/services/api";
import { clearPendingMsg91Password, setPendingMsg91Password } from "../src/services/authStorage";
import { MSG91_TOKEN_AUTH, MSG91_WIDGET_ID } from "../src/services/msg91";
import { completeMsg91Authentication, getPostAuthenticationRoute } from "../src/services/msg91Auth";

// MSG91's widget is a native module. Expo Go does not include that module,
// so keep the existing backend OTP route available for local Expo Go testing.
const isExpoGo = Constants.appOwnership === "expo"
    || Constants.executionEnvironment === "storeClient";
const OTPWidget = !isExpoGo && Platform.OS !== "web"
    ? require("@msg91comm/sendotp-react-native").OTPWidget
    : null;

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
    // MSG91 OTP
    // ============================================

    const completeInvisibleMsg91Otp = async (accessToken) => {
        const onboarding = await completeMsg91Authentication({
            mobile,
            mode: activeTab,
            password,
            accessToken,
        });
        await clearPendingMsg91Password();
        router.replace(getPostAuthenticationRoute({ onboarding, mobile, mode: activeTab }));
    };

    const openMsg91Widget = async () => {
        Keyboard.dismiss();

        if (isExpoGo) {
            requestBackendOtp();
            return;
        }

        if (!OTPWidget) {
            Alert.alert("Mobile verification unavailable", "This build does not include the MSG91 mobile verification module. Please install the latest review build.");
            return;
        }

        try {
            // Validates sign-in/sign-up requirements before an OTP is sent.
            await prepareMsg91Otp(mobile, activeTab, password);
            await setPendingMsg91Password(password);
            await OTPWidget.initializeWidget(MSG91_WIDGET_ID, MSG91_TOKEN_AUTH);

            const result = await OTPWidget.sendOTP({ identifier: `91${mobile}` });
            const accessToken = result?.["access-token"];
            if (result?.type !== "success") {
                throw new Error(result?.message || "MSG91 could not send an OTP. Please try again.");
            }

            if (accessToken && result?.invisibleVerified) {
                await completeInvisibleMsg91Otp(accessToken);
                return;
            }

            const requestId = String(result?.message || "");
            if (!requestId) {
                throw new Error("MSG91 did not return an OTP request. Please try again.");
            }

            router.push({
                pathname: "/otp",
                params: { mobile, mode: activeTab, provider: "msg91", requestId },
            });
        } catch (error) {
            await clearPendingMsg91Password();
            Alert.alert("Unable to send OTP", getUserFacingError(error));
        }
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
