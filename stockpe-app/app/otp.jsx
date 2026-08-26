import { Ionicons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";

import {
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { resendOtp, verifyOtp } from "./services/api";


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

            await SecureStore.setItemAsync("stockpe_auth_token", result.token);
            setIsVerifying(false);
            setIsVerified(true);
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

        <SafeAreaView style={styles.safeArea}>

            <KeyboardAvoidingView
                style={styles.container}
                behavior={
                    Platform.OS === "ios"
                        ? "padding"
                        : "height"
                }
            >

                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >


                    {/* =====================================
                        HEADER
                    ===================================== */}

                    <View style={styles.header}>

                        <View style={styles.headerLeft}>

                            <TouchableOpacity
                                style={styles.backButton}
                                onPress={handleBack}
                            >

                                <Ionicons
                                    name="chevron-back"
                                    size={27}
                                    color="#657189"
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


                        {/* STEP BADGE */}

                        <View style={styles.stepBadge}>

                            <Text style={styles.stepBadgeText}>
                                1/4
                            </Text>

                        </View>

                    </View>


                    {/* =====================================
                        PROGRESS
                    ===================================== */}

                    <View style={styles.progressBackground}>

                        <LinearGradient
                            colors={[
                                "#00C987",
                                "#6366F1",
                            ]}
                            start={{
                                x: 0,
                                y: 0,
                            }}
                            end={{
                                x: 1,
                                y: 0,
                            }}
                            style={styles.progress}
                        />

                    </View>


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
        backgroundColor: "#F5F7FF",
    },

    container: {
        flex: 1,
    },

    scrollContent: {
        flexGrow: 1,
        paddingBottom: 35,
        paddingTop:40,
    },


    /* ================= HEADER ================= */

    header: {
        height: 90,
        backgroundColor: "#FFFFFF",

        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",

        paddingHorizontal: 27, 
    },

    headerLeft: {
        marginLeft:-10,
        flexDirection: "row",
        alignItems: "center",
    },

    backButton: {
        width: 40,
        height: 40,

        borderRadius: 29,

        backgroundColor: "#EEF1FB",

        alignItems: "center",
        justifyContent: "center",

        marginRight: 14,

        borderWidth: 1,
        borderColor: "#E0E5F1",
    },

    headerTitle: {
        fontSize: 18,
        fontWeight: "900",
        color: "#071329",
    },

    headerSubtitle: {
        fontSize: 14,
        color: "#737D91",
        marginTop: 2,
    },

    stepBadge: {
        paddingHorizontal: 18,
        paddingVertical: 9,

        borderRadius: 22,

        backgroundColor: "#EEF1FB",

        borderWidth: 1,
        borderColor: "#E0E5F1",
    },

    stepBadgeText: {
        fontSize: 12,
         fontWeight: "700",
        color: "#657189",
    },


    /* ================= PROGRESS ================= */

    progressBackground: {
        height: 4,
        width: "100%",
        backgroundColor: "#E5E8F1",
    },

    progress: {
        width: "25%",
        height: "100%",
    },


    /* ================= CONTENT ================= */

    content: {
        flex: 1,

        alignItems: "center",

        paddingHorizontal: 40,

        paddingTop: 125,
    },


    /* ================= PHONE ================= */

    phoneIconContainer: {
        width: 112,
        height: 112,
        borderRadius: 56,

        borderWidth: 2,

        borderColor: "rgba(0,201,135,0.25)",

        backgroundColor: "rgba(0,201,135,0.04)",

        alignItems: "center",
        justifyContent: "center",

        marginBottom: 22,
    },


    /* ================= TITLE ================= */

    title: {
        fontSize: 42,
        fontWeight: "900",

        color: "#071329",

        marginBottom: 8,
    },

    sentText: {
        fontSize: 20,

        color: "#737D91",

        marginBottom: 43,
    },

    mobileNumber: {
        color: "#071329",
        fontWeight: "700",
    },


    /* ================= OTP ================= */

    otpContainer: {
        width: "100%",

        flexDirection: "row",

        justifyContent: "space-between",

        marginBottom: 48,
    },

    otpInput: {
        width: 52,
        height: 56,

        borderRadius: 20,

        backgroundColor: "#FFFFFF",

        borderWidth: 1,
        borderColor: "rgba(0, 201, 135, 1.00)",

        fontSize: 28,
        fontWeight: "700",

        color: "#071329",

        shadowColor: "#000000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.04,
        shadowRadius: 8,

        elevation: 2,
    },

    otpInputActive: {
        borderColor: "#00C987",
    },


    /* ================= RESEND ================= */

    resendText: {
        fontSize: 20,
        color: "#737D91",

        marginBottom: 48,
    },

    resendTime: {
        color: "#E8A400",
        fontWeight: "700",
    },

    resendActive: {
        color: "#00A875",
        fontWeight: "700",
    },


    /* ================= DEMO ================= */

    demoBox: {
        width: "100%",

        minHeight: 68,

        borderRadius: 18,

        borderWidth: 1.5,

        borderColor: "#F2D86D",

        backgroundColor: "#FFFBEA",

        flexDirection: "row",

        alignItems: "center",

        paddingHorizontal: 20,

        marginBottom: 54,
    },

    demoText: {
        flex: 1,

        fontSize: 16,

        color: "#737D91",

        marginLeft: 13,
    },

    apiErrorText: {
        width: "100%",
        color: "#C73D3D",
        backgroundColor: "#FFF0F0",
        borderRadius: 14,
        fontSize: 15,
        lineHeight: 21,
        marginTop: -30,
        marginBottom: 30,
        padding: 14,
        textAlign: "center",
    },


    /* ================= VERIFY ================= */

    verifyButton: {
        width: "100%",

        height: 78,

        borderRadius: 21,

        backgroundColor: "#00C987",

        flexDirection: "row",

        alignItems: "center",

        justifyContent: "center",

        gap: 13,

        shadowColor: "#00C987",

        shadowOffset: {
            width: 0,
            height: 8,
        },

        shadowOpacity: 0.25,

        shadowRadius: 14,

        elevation: 7,
    },


    verifyButtonDisabled: {
        opacity: 0.45,
    },

    verifyText: {
        color: "#FFFFFF",

        fontSize: 21,

        fontWeight: "900",

        letterSpacing: 0.5,
    },

});
