import { Ionicons } from "@expo/vector-icons";
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
    useWindowDimensions,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
    getOnboardingStatus,
    getUserFacingError,
    resendOtp,
    verifyOtp,
} from "../src/services/api";
import { setAuthToken } from "../src/services/authStorage";
import { registerCurrentDeviceForPush } from "../src/services/pushNotifications";

export default function OTP() {

    const { mobile, mode } = useLocalSearchParams();
    const { width, height } = useWindowDimensions();
    const isCompact = width < 600 || height < 800;

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

    const fillOtpDigits = (value, startIndex) => {
        const digits = value.replace(/[^0-9]/g, "");
        const updatedOtp = [...otp];

        if (!digits) {
            updatedOtp[startIndex] = "";
            setOtp(updatedOtp);
            return;
        }

        digits
            .slice(0, otp.length - startIndex)
            .split("")
            .forEach((digit, offset) => {
                updatedOtp[startIndex + offset] = digit;
            });
        setOtp(updatedOtp);

        const nextIndex = Math.min(
            startIndex + digits.length,
            otp.length - 1
        );
        inputRefs.current[nextIndex]?.focus();
    };

    const handleOtpChange = (value, index) => {
        const digits = value.replace(/[^0-9]/g, "");
        fillOtpDigits(value, digits.length > 1 ? 0 : index);
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

            if (result?.token) {
                await setAuthToken(result.token);
                // Push permission/token errors must never interrupt sign-in.
                registerCurrentDeviceForPush().catch(() => {});
            }
            setIsVerifying(false);
            setIsVerified(true);

            // A returning user who has already completed both setup steps
            // should not be sent through Aadhaar KYC and wallet linking again.
            // New and incomplete users keep the existing onboarding route.
            let onboardingCompleted = false;
            if (mode === "signin") {
                try {
                    const onboarding = await getOnboardingStatus();
                    onboardingCompleted = onboarding?.onboardingCompleted === true;
                } catch (_onboardingError) {
                    // Keep the safe existing route when status cannot be read.
                    onboardingCompleted = false;
                }
            }

            setTimeout(() => {
                if (onboardingCompleted) {
                    router.replace("/(tabs)/events");
                    return;
                }

                router.replace({
                    pathname: "/aadhaar",
                    params: { mobile: String(mobile), mode: mode || "signin" },
                });
            }, 500);
        } catch (error) {
            setApiError(getUserFacingError(error));
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
            setApiError(getUserFacingError(error));
        }

    };


    /* =========================================
       BACK
    ========================================= */

    const handleBack = () => {

        Keyboard.dismiss();
        router.replace("/login");

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
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >


                    {/* =====================================
                        MAIN CONTENT
                    ===================================== */}

                    <View
                        style={[
                            styles.content,
                            isCompact && styles.contentCompact,
                        ]}
                    >


                        {/* PHONE ICON */}

                        <View
                            style={[
                                styles.phoneIconContainer,
                                isCompact && styles.phoneIconCompact,
                            ]}
                        >

                            <Ionicons
                                name="call-outline"
                                size={32}
                                color="#00C987"
                            />

                        </View>


                        {/* TITLE */}

                        <Text
                            style={[
                                styles.title,
                                isCompact && styles.titleCompact,
                            ]}
                        >
                            Enter OTP
                        </Text>


                        {/* MOBILE */}

                        <Text
                            style={[
                                styles.sentText,
                                isCompact && styles.sentTextCompact,
                            ]}
                        >

                            Sent to{" "}

                            <Text style={styles.mobileNumber}>
                                +91-{formattedMobile}
                            </Text>

                        </Text>


                        {/* =================================
                            OTP INPUTS
                        ================================= */}

                        <View
                            style={[
                                styles.otpContainer,
                                isCompact && styles.otpContainerCompact,
                            ]}
                        >

                            {otp.map((value, index) => (

                                <TextInput
                                    key={index}
                                    autoFocus={index === 0}
                                    autoComplete={
                                        index === 0
                                            ? "one-time-code"
                                             : "off"
                                    }
                                    textContentType={
                                        index === 0
                                            ? "oneTimeCode"
                                            : "none"
                                    }
                                    importantForAutofill={
                                        index === 0 ? "yes" : "no"
                                    }
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
                                    selectTextOnFocus
                                    style={[
                                        styles.otpInput,
                                        isCompact &&
                                            styles.otpInputCompact,
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
                            accessibilityRole="button"
                            accessibilityState={{
                                disabled: seconds > 0,
                            }}
                        >

                            <Text
                                style={[
                                    styles.resendText,
                                    isCompact &&
                                        styles.resendTextCompact,
                                    seconds === 0 &&
                                        styles.resendActive,
                                ]}
                            >
                                {seconds > 0 ? (
                                    <>
                                        Resend in{" "}
                                        <Text style={styles.resendTime}>
                                            {seconds}s
                                        </Text>
                                    </>
                                ) : (
                                    "Resend OTP"
                                )}

                            </Text>

                        </TouchableOpacity>

                    </View>

                </ScrollView>

                <View
                    style={[
                        styles.footer,
                        isCompact && styles.footerCompact,
                    ]}
                >

                    {/* =================================
                        OTP INFORMATION
                    ================================= */}

                        <View
                            style={[
                                styles.demoBox,
                                isCompact && styles.demoBoxCompact,
                            ]}
                        >

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
                                isCompact &&
                                    styles.verifyButtonCompact,
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

    scrollView: {
        flex: 1,
    },

    scrollContent: {
        flexGrow: 1,
        paddingTop: 40,
        paddingBottom: 16,
    },

    footer: {
        backgroundColor: "#F5F7FF",
        paddingHorizontal: 40,
        paddingTop: 16,
        paddingBottom: 35,
    },

    footerCompact: {
        paddingHorizontal: 20,
        paddingBottom: 24,
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

    contentCompact: {
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

    phoneIconCompact: {
        width: 64,
        height: 64,
        borderRadius: 32,
        marginBottom: 14,
    },

    /* ================= TITLE ================= */
    title: {
        fontSize: 22,
        fontWeight: "900",
        color: "#0F172A",
        marginBottom: 6,
    },

    titleCompact: {
        fontSize: 30,
        marginBottom: 4,
    },

    sentText: {
        fontSize: 13,
        color: "#64748B",
        marginBottom: 28,
        textAlign: "center",
    },

    sentTextCompact: {
        fontSize: 16,
        marginBottom: 24,
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

    otpContainerCompact: {
        marginBottom: 28,
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

    otpInputCompact: {
        height: 48,
        borderRadius: 14,
        fontSize: 24,
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

    resendTextCompact: {
        fontSize: 16,
        marginBottom: 28,
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

    demoBoxCompact: {
        minHeight: 58,
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

    verifyButtonCompact: {
        height: 60,
        borderRadius: 18,
    },

    verifyButtonDisabled: {
        opacity: 0.5,
    },

    verifyButtonSuccess: {
        backgroundColor: "#059669",
    },

    verifyText: {
        color: "#FFFFFF",
        fontSize: 15,
        fontWeight: "900",
        letterSpacing: 0.8,
    },
});
