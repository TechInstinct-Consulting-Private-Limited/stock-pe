import { Ionicons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";

import {
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { resendOtp, verifyOtp } from "../src/services/api";


export default function OTP() {

    const { mobile, mode } = useLocalSearchParams();

    const [otp, setOtp] = useState([
        "",
        "",
        "",
        "",
        "",
        "",
    ]);

    const [seconds, setSeconds] = useState(23);

    const inputRefs = useRef([]);

    const [isVerifying, setIsVerifying] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [apiError, setApiError] = useState("");


    /* =========================================
       RESEND COUNTDOWN
    ========================================= */

    useEffect(() => {

        if (seconds <= 0) {
            return;
        }

        const timer = setInterval(() => {

            setSeconds((previous) => {

                if (previous <= 1) {
                    clearInterval(timer);
                    return 0;
                }

                return previous - 1;
            });

        }, 1000);


        return () => clearInterval(timer);

    }, [seconds]);


    /* =========================================
       MOBILE NUMBER
    ========================================= */

    const formattedMobile = mobile
        ? String(mobile)
        : "99609•••••";


    /* =========================================
       OTP CHANGE
    ========================================= */

    const handleOtpChange = (value, index) => {

        // Only numbers
        const number = value.replace(/[^0-9]/g, "");

        const updatedOtp = [...otp];

        updatedOtp[index] = number;

        setOtp(updatedOtp);


        // Move to next box
        if (number && index < 5) {

            inputRefs.current[index + 1]?.focus();

        }

    };


    /* =========================================
       BACKSPACE
    ========================================= */

    const handleKeyPress = (event, index) => {

        if (
            event.nativeEvent.key === "Backspace" &&
            !otp[index] &&
            index > 0
        ) {

            inputRefs.current[index - 1]?.focus();

        }

    };

    const isOtpComplete = otp.every(
        (digit) => digit !== ""
    );


    /* =========================================
       VERIFY OTP
    ========================================= */

    const saveAuthToken = async (token) => {
        if (Platform.OS === "web") {
            try {
                if (typeof window !== "undefined" && window.localStorage) {
                    window.localStorage.setItem("stockpe_auth_token", token);
                }
            } catch (e) {
                console.warn("Unable to save auth token to localStorage", e);
            }
        } else {
            await SecureStore.setItemAsync("stockpe_auth_token", token);
        }
    };

    const handleVerifyOtp = async () => {

        const enteredOtp = otp.join("");

        if (enteredOtp.length !== 6) {
            console.log("Please enter complete OTP");
            return;
        }

        Keyboard.dismiss();

        setIsVerifying(true);
        setApiError("");

        try {
            const result = await verifyOtp(
                String(mobile),
                enteredOtp,
                mode === "signin" ? "signin" : "signup"
            );

            await saveAuthToken(result.token);
            setIsVerifying(false);
            setIsVerified(true);
            setTimeout(() => {
                router.replace({
                    pathname: "/aadhaar",
                    params: { mobile: String(mobile), mode: mode || "signin" },
                });
            }, 500);
        } catch (error) {
            setApiError(error.message);
            setIsVerifying(false);
        }
    };


    /* =========================================
       RESEND OTP
    ========================================= */

    const handleResend = async () => {

        if (seconds > 0) {
            return;
        }


        try {
            setApiError("");
            await resendOtp(
                String(mobile),
                mode === "signin" ? "signin" : "signup"
            );

            setOtp(["", "", "", "", "", ""]);
            setSeconds(60);
            inputRefs.current[0]?.focus();
        } catch (error) {
            setApiError(error.message);
        }

    };


    /* =========================================
       BACK
    ========================================= */

    const handleBack = () => {

        Keyboard.dismiss();

        router.back();

    };


    return (

        <SafeAreaView edges={["top", "bottom", "left", "right"]} style={styles.safeArea}>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
                {/* Fixed Header */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={handleBack}
                        >
                            <Ionicons
                                name="chevron-back"
                                size={22}
                                color="#64748B"
                            />
                        </TouchableOpacity>

                        <View>
                            <Text style={styles.headerTitle}>
                                Verify Mobile
                            </Text>
                            <Text style={styles.headerSubtitle}>
                                Step 1 of 4
                            </Text>
                        </View>
                    </View>

                    <View style={styles.stepBadge}>
                        <Text style={styles.stepBadgeText}>
                            1/4
                        </Text>
                    </View>
                </View>

                {/* Progress Bar */}
                <View style={styles.progressBackground}>
                    <LinearGradient
                        colors={["#00C987", "#38BDF8"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.progress}
                    />
                </View>

                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >


                    {/* =====================================
                        MAIN CONTENT
                    ===================================== */}

                    <View style={styles.content}>


                        {/* PHONE ICON */}

                        <View style={styles.phoneIconContainer}>

                            <Ionicons
                                name="call-outline"
                                size={32}
                                color="#00C987"
                            />

                        </View>


                        {/* TITLE */}

                        <Text style={styles.title}>
                            Enter OTP
                        </Text>


                        {/* MOBILE */}

                        <Text style={styles.sentText}>

                            Sent to{" "}

                            <Text style={styles.mobileNumber}>
                                +91-{formattedMobile}
                            </Text>

                        </Text>


                        {/* =================================
                            OTP INPUTS
                        ================================= */}

                        <View style={styles.otpContainer}>

                            {otp.map((value, index) => (

                                <TextInput
                                    key={index}
                                    ref={(ref) => {
                                        inputRefs.current[index] =
                                            ref;
                                    }}
                                    value={value}
                                    onChangeText={(text) =>
                                        handleOtpChange(
                                            text,
                                            index
                                        )
                                    }
                                    onKeyPress={(event) =>
                                        handleKeyPress(
                                            event,
                                            index
                                        )
                                    }
                                    keyboardType="number-pad"
                                    maxLength={1}
                                    textAlign="center"
                                    style={[
                                        styles.otpInput,
                                        value &&
                                            styles.otpInputActive,
                                    ]}
                                    selectionColor="#00C987"
                                />

                            ))}

                        </View>


                        {/* =================================
                            RESEND
                        ================================= */}

                        <TouchableOpacity
                            disabled={seconds > 0}
                            onPress={handleResend}
                        >

                            <Text style={styles.resendText}>

                                Resend in{" "}

                                <Text
                                    style={
                                        seconds > 0
                                            ? styles.resendTime
                                            : styles.resendActive
                                    }
                                >
                                    {seconds}s
                                </Text>

                            </Text>

                        </TouchableOpacity>


                        {/* =================================
                            DEMO MODE
                        ================================= */}

                        <View style={styles.demoBox}>

                            <Ionicons
                                name="information-circle-outline"
                                size={20}
                                color="#E8A400"
                            />

                            <Text style={styles.demoText}>
                                Enter the OTP sent to your mobile number
                            </Text>

                        </View>

                        {apiError ? (
                            <Text style={styles.apiErrorText}>
                                {apiError}
                            </Text>
                        ) : null}


                        {/* =================================
                            VERIFY BUTTON
                        ================================= */}

                        <TouchableOpacity
                            style={[
                                styles.verifyButton,
                                (!isOtpComplete || isVerifying || isVerified) &&
                                    styles.verifyButtonDisabled,
                                isVerified && styles.verifyButtonSuccess,
                            ]}
                            onPress={handleVerifyOtp}
                            disabled={!isOtpComplete || isVerifying || isVerified}
                            activeOpacity={0.8}
                        >
                            {isVerified ? (
                                <>
                                    <Ionicons
                                        name="checkmark-circle"
                                        size={27}
                                        color="#FFFFFF"
                                    />

                                    <Text style={styles.verifyText}>
                                        OTP VERIFIED
                                    </Text>
                                </>
                            ) : isVerifying ? (
                                <Text style={styles.verifyText}>
                                    VERIFYING...
                                </Text>
                            ) : (
                                <>
                                    <Text style={styles.verifyText}>
                                        VERIFY OTP
                                    </Text>

                                    <Ionicons
                                        name="arrow-forward"
                                        size={29}
                                        color="#FFFFFF"
                                    />
                                </>
                            )}
                        </TouchableOpacity>


                    </View>

                </ScrollView>

            </KeyboardAvoidingView>

        </SafeAreaView>
    );
}


/* =====================================================
   STYLES
===================================================== */

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },

    container: {
        flex: 1,
    },

    scrollContent: {
        flexGrow: 1,
        paddingBottom: 35,
    },

    /* ================= HEADER ================= */
    header: {
        height: 56,
        backgroundColor: "#FFFFFF",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#EDF2F7",
    },

    headerLeft: {
        flexDirection: "row",
        alignItems: "center",
    },

    backButton: {
        width: 38,
        height: 38,
        borderRadius: 12,
        backgroundColor: "#F8FAFC",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },

    headerTitle: {
        fontSize: 16,
        fontWeight: "900",
        color: "#0F172A",
    },


    headerSubtitle: {
        fontSize: 14,
        color: "#737D91",
        marginTop: 2,
    },

    stepBadge: {
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 12,
        backgroundColor: "#E6FBF3",
        borderWidth: 1,
        borderColor: "#A7F3D0",
    },

    stepBadgeText: {
        fontSize: 11,
        fontWeight: "900",
        color: "#059669",
    },

    /* ================= PROGRESS ================= */
    progressBackground: {
        height: 3,
        width: "100%",
        backgroundColor: "#EDF2F7",
    },

    progress: {
        width: "25%",
        height: "100%",
    },

    /* ================= CONTENT ================= */
    content: {
        flex: 1,
        alignItems: "center",
        paddingHorizontal: 20,
        paddingTop: 28,
    },

    /* ================= PHONE ================= */
    phoneIconContainer: {
        width: 64,
        height: 64,
        borderRadius: 20,
        borderWidth: 1.5,
        borderColor: "#A7F3D0",
        backgroundColor: "#E6FBF3",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 16,
    },

    /* ================= TITLE ================= */
    title: {
        fontSize: 22,
        fontWeight: "900",
        color: "#0F172A",
        marginBottom: 6,
    },

    sentText: {
        fontSize: 13,
        color: "#64748B",
        marginBottom: 28,
        textAlign: "center",
    },

    mobileNumber: {
        color: "#0F172A",
        fontWeight: "800",
    },

    /* ================= OTP ================= */
    otpContainer: {
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 24,
    },

    otpInput: {
        width: 48,
        height: 54,
        borderRadius: 14,
        backgroundColor: "#F8FAFC",
        borderWidth: 1.5,
        borderColor: "#E2E8F0",
        fontSize: 22,
        fontWeight: "800",
        color: "#0F172A",
        textAlign: "center",
        shadowColor: "#0F172A",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.03,
        shadowRadius: 4,
        elevation: 1,
    },

    otpInputActive: {
        borderColor: "#00C987",
        backgroundColor: "#FFFFFF",
    },

    /* ================= RESEND ================= */
    resendText: {
        fontSize: 13,
        color: "#64748B",
        marginBottom: 24,
    },

    resendTime: {
        color: "#F59E0B",
        fontWeight: "700",
    },

    resendActive: {
        color: "#00C987",
        fontWeight: "800",
    },

    /* ================= DEMO ================= */
    demoBox: {
        width: "100%",
        minHeight: 52,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "#FDE68A",
        backgroundColor: "#FFFBEB",
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 14,
        marginBottom: 24,
    },

    demoText: {
        flex: 1,
        fontSize: 12,
        fontWeight: "600",
        color: "#92400E",
        marginLeft: 10,
    },

    apiErrorText: {
        width: "100%",
        color: "#DC2626",
        backgroundColor: "#FEF2F2",
        borderRadius: 12,
        fontSize: 12.5,
        fontWeight: "600",
        lineHeight: 18,
        marginBottom: 16,
        padding: 12,
        textAlign: "center",
        borderWidth: 1,
        borderColor: "#FEE2E2",
    },

    /* ================= VERIFY ================= */
    verifyButton: {
        width: "100%",
        height: 52,
        borderRadius: 14,
        backgroundColor: "#00C987",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        shadowColor: "#00C987",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.22,
        shadowRadius: 8,
        elevation: 4,
    },

    verifyButtonDisabled: {
        opacity: 0.5,
    },

    verifyText: {
        color: "#FFFFFF",
        fontSize: 15,
        fontWeight: "900",
        letterSpacing: 0.8,
    },
});

