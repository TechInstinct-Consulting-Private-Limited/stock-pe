import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
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

import {
    getUserFacingError,
    requestAadhaarOtp,
    verifyAadhaarOtp,
} from "../src/services/api";

const EMPTY_OTP = ["", "", "", "", "", ""];

const RESEND_SECONDS = 30;

export default function AadhaarKyc() {
    const {
        verified,
        mobile,
        mode,
        verificationId: incomingVerificationId,
        aadhaarLastFour: incomingLastFour,
    } = useLocalSearchParams();
    const [aadhaarNumber, setAadhaarNumber] = useState("");
    const [consent, setConsent] = useState(false);
    const [verificationId, setVerificationId] = useState(
        String(incomingVerificationId || "")
    );
    const [otp, setOtp] = useState(EMPTY_OTP);
    const [isLoading, setIsLoading] = useState(false);
    const [isVerified, setIsVerified] = useState(verified === "1");
    const [error, setError] = useState("");
    const [secondsLeft, setSecondsLeft] = useState(
        incomingVerificationId ? RESEND_SECONDS : 0
    );
    const otpRefs = useRef([]);
    const aadhaarLastFour = String(incomingLastFour || aadhaarNumber.slice(-4));

    useEffect(() => {
        if (secondsLeft <= 0) return undefined;
        const timer = setTimeout(() => setSecondsLeft((value) => value - 1), 1000);
        return () => clearTimeout(timer);
    }, [secondsLeft]);

    useEffect(() => {
        if (!verificationId || isVerified) return;
        requestAnimationFrame(() => otpRefs.current[0]?.focus());
    }, [verificationId, isVerified]);

    // Arriving here already verified (Secure QR scan or a previous session)
    // means step 3 has nothing to collect, so continue to the wallet step.
    useEffect(() => {
        if (verified !== "1") return;
        router.replace({
            pathname: "/usdt-wallet",
            params: {
                mobile: String(mobile || ""),
                mode: mode === "signin" ? "signin" : "signup",
            },
        });
    }, [verified, mobile, mode]);

    const goToWallet = () => {
        router.replace({
            pathname: "/usdt-wallet",
            params: {
                mobile: String(mobile || ""),
                mode: mode === "signin" ? "signin" : "signup",
            },
        });
    };

    const handleResend = async () => {
        if (secondsLeft > 0 || isLoading || !aadhaarLastFour) return;

        setIsLoading(true);
        setError("");

        try {
            const result = await requestAadhaarOtp(aadhaarNumber || String(incomingLastFour || ""), true);
            setVerificationId(result.verificationId);
            setOtp(EMPTY_OTP);
            setSecondsLeft(RESEND_SECONDS);
            requestAnimationFrame(() => otpRefs.current[0]?.focus());
        } catch (resendError) {
            setError(getUserFacingError(resendError));
        } finally {
            setIsLoading(false);
        }
    };

    const handleBack = () => {
        Keyboard.dismiss();

        // Aadhaar KYC is one-time, so once verified there is nothing to go
        // back and change on step 2.
        if (isVerified) return;

        router.replace({
            pathname: "/aadhaar",
            params: {
                mobile: String(mobile || ""),
                mode: mode === "signin" ? "signin" : "signup",
            },
        });
    };

    const handleAadhaarChange = (value) => {
        setAadhaarNumber(value.replace(/\D/g, "").slice(0, 12));
        setError("");
    };

    const handleRequestOtp = async () => {
        if (aadhaarNumber.length !== 12) {
            setError("Enter a valid 12-digit Aadhaar number.");
            return;
        }

        if (!consent) {
            setError("Consent is required to verify your Aadhaar.");
            return;
        }

        Keyboard.dismiss();
        setIsLoading(true);
        setError("");

        try {
            const result = await requestAadhaarOtp(aadhaarNumber, true);
            setVerificationId(result.verificationId);
            setOtp(EMPTY_OTP);
            setSecondsLeft(RESEND_SECONDS);
            requestAnimationFrame(() => otpRefs.current[0]?.focus());
        } catch (requestError) {
            setError(getUserFacingError(requestError));
        } finally {
            setIsLoading(false);
        }
    };

    const handleOtpChange = (value, index) => {
        const digits = value.replace(/\D/g, "");
        const nextOtp = [...otp];

        if (!digits) {
            nextOtp[index] = "";
            setOtp(nextOtp);
            return;
        }

        const startIndex = digits.length > 1 ? 0 : index;
        digits
            .slice(0, nextOtp.length - startIndex)
            .split("")
            .forEach((digit, offset) => {
                nextOtp[startIndex + offset] = digit;
            });
        setOtp(nextOtp);

        const nextIndex = Math.min(
            startIndex + digits.length,
            nextOtp.length - 1
        );
        otpRefs.current[nextIndex]?.focus();
    };

    const handleVerifyOtp = async () => {
        const enteredOtp = otp.join("");

        if (enteredOtp.length !== 6) {
            setError("Enter the complete 6-digit OTP.");
            return;
        }

        Keyboard.dismiss();
        setIsLoading(true);
        setError("");

        try {
            await verifyAadhaarOtp(verificationId, enteredOtp);
            setAadhaarNumber("");
            setOtp(EMPTY_OTP);
            setIsVerified(true);
            goToWallet();
        } catch (verificationError) {
            setError(getUserFacingError(verificationError));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView edges={["top", "bottom", "left", "right"]} style={styles.safeArea}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.container}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.header}>
                        <TouchableOpacity
                            onPress={handleBack}
                            disabled={isVerified}
                            style={[styles.backButton, isVerified && styles.backButtonHidden]}
                        >
                            <Ionicons name="chevron-back" size={26} color="#657189" />
                        </TouchableOpacity>
                        <View style={styles.headerCopy}>
                            <Text style={styles.headerTitle}>Aadhaar OTP</Text>
                            <Text style={styles.headerSubtitle}>
                                UIDAI verification · Step 3 of 4
                            </Text>
                        </View>
                        <View style={styles.stepBadge}>
                            <Text style={styles.stepBadgeText}>3/4</Text>
                        </View>
                    </View>

                    <View style={styles.progressTrack}>
                        <LinearGradient
                            colors={["#00C987", "#6366F1"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.progress}
                        />
                    </View>

                    <View style={styles.content}>
                        <View style={styles.iconCircle}>
                            <Ionicons
                                name={isVerified ? "shield-checkmark" : "finger-print"}
                                size={38}
                                color={isVerified ? "#00B978" : "#594BFF"}
                            />
                        </View>

                        <Text style={styles.title}>
                            {isVerified ? "Aadhaar verified" : "Aadhaar OTP"}
                        </Text>
                        {isVerified ? (
                            <Text style={styles.description}>
                                Your identity verification was completed successfully.
                            </Text>
                        ) : verificationId ? (
                            <>
                                <Text style={styles.description}>Aadhaar-linked mobile</Text>
                                <Text style={styles.maskedAadhaar}>
                                    XXXX XXXX {aadhaarLastFour}
                                </Text>
                            </>
                        ) : (
                            <Text style={styles.description}>
                                Verify your Aadhaar using the OTP sent to its linked mobile number.
                            </Text>
                        )}

                        {!verificationId && !isVerified ? (
                            <>
                                <Text style={styles.label}>AADHAAR NUMBER</Text>
                                <View style={styles.inputContainer}>
                                    <Ionicons name="card-outline" size={22} color="#657189" />
                                    <TextInput
                                        autoFocus
                                        keyboardType="number-pad"
                                        maxLength={12}
                                        onChangeText={handleAadhaarChange}
                                        placeholder="1234 5678 9012"
                                        placeholderTextColor="#AEB5C7"
                                        style={styles.aadhaarInput}
                                        value={aadhaarNumber}
                                    />
                                </View>

                                <TouchableOpacity
                                    activeOpacity={0.8}
                                    onPress={() => setConsent((value) => !value)}
                                    style={styles.consentRow}
                                >
                                    <View style={[styles.checkbox, consent && styles.checkboxActive]}>
                                        {consent ? (
                                            <Ionicons name="checkmark" size={17} color="#FFFFFF" />
                                        ) : null}
                                    </View>
                                    <Text style={styles.consentText}>
                                        I consent to Aadhaar OTP verification for completing KYC.
                                    </Text>
                                </TouchableOpacity>
                            </>
                        ) : null}

                        {verificationId && !isVerified ? (
                            <View style={styles.otpRow}>
                                {otp.map((digit, index) => (
                                    <TextInput
                                        autoComplete={index === 0 ? "one-time-code" : "off"}
                                        importantForAutofill={index === 0 ? "yes" : "no"}
                                        key={index}
                                        keyboardType="number-pad"
                                        onChangeText={(value) => handleOtpChange(value, index)}
                                        onKeyPress={(event) => {
                                            if (
                                                event.nativeEvent.key === "Backspace" &&
                                                !otp[index] &&
                                                index > 0
                                            ) {
                                                otpRefs.current[index - 1]?.focus();
                                            }
                                        }}
                                        ref={(ref) => {
                                            otpRefs.current[index] = ref;
                                        }}
                                        selectTextOnFocus
                                        style={[styles.otpInput, digit && styles.otpInputActive]}
                                        textContentType={index === 0 ? "oneTimeCode" : "none"}
                                        value={digit}
                                    />
                                ))}
                            </View>
                        ) : null}

                        {verificationId && !isVerified ? (
                            <TouchableOpacity
                                onPress={handleResend}
                                disabled={secondsLeft > 0 || isLoading}
                                style={styles.resendRow}
                            >
                                <Text style={styles.resendText}>
                                    {secondsLeft > 0 ? "Resend in " : "Didn't get it? "}
                                    <Text style={styles.resendAccent}>
                                        {secondsLeft > 0 ? `${secondsLeft}s` : "RESEND OTP"}
                                    </Text>
                                </Text>
                            </TouchableOpacity>
                        ) : null}

                        {verificationId && !isVerified ? (
                            <View style={styles.infoBanner}>
                                <Ionicons name="information-circle-outline" size={20} color="#5865D9" />
                                <Text style={styles.infoBannerText}>
                                    UIDAI OTP sent to your Aadhaar-registered mobile number.
                                </Text>
                            </View>
                        ) : null}

                        {error ? <Text style={styles.errorText}>{error}</Text> : null}

                        {!isVerified ? (
                            <TouchableOpacity
                                disabled={isLoading}
                                onPress={verificationId ? handleVerifyOtp : handleRequestOtp}
                                style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="#FFFFFF" />
                                ) : (
                                    <>
                                        <Text style={styles.buttonText}>
                                            {verificationId ? "VERIFY AADHAAR" : "SEND AADHAAR OTP"}
                                        </Text>
                                        <Ionicons name="arrow-forward" size={25} color="#FFFFFF" />
                                    </>
                                )}
                            </TouchableOpacity>
                        ) : null}

                        {__DEV__ && !isVerified ? (
                            <Text style={styles.devHint}>
                                Development: use Aadhaar 999999999999 and OTP 123456.
                            </Text>
                        ) : null}
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: "#F4F6FB" },
    container: { flex: 1 },
    scrollContent: { flexGrow: 1, paddingBottom: 32 },
    header: {
        alignItems: "center",
        flexDirection: "row",
        paddingHorizontal: 16,
        paddingVertical: 14,
        backgroundColor: "#FFFFFF",
        borderBottomWidth: 1,
        borderBottomColor: "#EDF2F7",
    },
    backButton: {
        alignItems: "center",
        backgroundColor: "#F8FAFC",
        borderRadius: 12,
        height: 40,
        justifyContent: "center",
        width: 40,
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    backButtonHidden: { opacity: 0 },
    headerCopy: { flex: 1, marginLeft: 12 },
    headerTitle: { color: "#0F172A", fontSize: 17, fontWeight: "900" },
    headerSubtitle: { color: "#64748B", fontSize: 12, marginTop: 1 },
    stepBadge: {
        backgroundColor: "#E6FBF3",
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderWidth: 1,
        borderColor: "#A7F3D0",
    },
    stepBadgeText: { color: "#059669", fontSize: 11, fontWeight: "900" },
    maskedAadhaar: {
        color: "#0F172A",
        fontSize: 18,
        fontWeight: "900",
        letterSpacing: 2,
        marginTop: 6,
        textAlign: "center",
    },
    resendRow: { marginTop: 20, alignSelf: "center" },
    resendText: { color: "#64748B", fontSize: 13 },
    resendAccent: { color: "#F59E0B", fontWeight: "800" },
    infoBanner: {
        alignItems: "center",
        borderColor: "#E2E8F0",
        borderRadius: 14,
        borderWidth: 1,
        backgroundColor: "#FFFFFF",
        flexDirection: "row",
        gap: 10,
        marginTop: 20,
        paddingHorizontal: 14,
        paddingVertical: 12,
    },
    infoBannerText: { color: "#64748B", flex: 1, fontSize: 12, lineHeight: 17 },
    progressTrack: { backgroundColor: "#EDF2F7", height: 3 },
    progress: { borderRadius: 2, height: 3, width: "75%", backgroundColor: "#00C987" },
    content: { flex: 1, paddingHorizontal: 20, paddingTop: 24 },

    iconCircle: {
        alignItems: "center",
        alignSelf: "center",
        backgroundColor: "#E4E7FF",
        borderRadius: 22,
        height: 68,
        justifyContent: "center",
        width: 68,
    },
    title: {
        color: "#071329",
        fontSize: 28,
        fontWeight: "900",
        marginTop: 22,
        textAlign: "center",
    },
    description: {
        color: "#737D91",
        fontSize: 15,
        lineHeight: 22,
        marginBottom: 34,
        marginTop: 10,
        textAlign: "center",
    },
    label: { color: "#737D91", fontSize: 12, letterSpacing: 2, marginBottom: 10 },
    inputContainer: {
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        borderColor: "#DDE2F0",
        borderRadius: 20,
        borderWidth: 1,
        flexDirection: "row",
        height: 64,
        paddingHorizontal: 18,
    },
    aadhaarInput: { color: "#071329", flex: 1, fontSize: 18, letterSpacing: 2, marginLeft: 12 },
    consentRow: { alignItems: "flex-start", flexDirection: "row", marginTop: 22 },
    checkbox: {
        alignItems: "center",
        borderColor: "#AEB5C7",
        borderRadius: 6,
        borderWidth: 1.5,
        height: 23,
        justifyContent: "center",
        marginRight: 11,
        width: 23,
    },
    checkboxActive: { backgroundColor: "#00B978", borderColor: "#00B978" },
    consentText: { color: "#657189", flex: 1, fontSize: 13, lineHeight: 19 },
    otpRow: { flexDirection: "row", gap: 8, justifyContent: "center" },
    otpInput: {
        backgroundColor: "#FFFFFF",
        borderColor: "#DDE2F0",
        borderRadius: 14,
        borderWidth: 1.5,
        color: "#071329",
        fontSize: 23,
        fontWeight: "800",
        height: 58,
        textAlign: "center",
        width: 45,
    },
    otpInputActive: { borderColor: "#00B978" },
    errorText: { color: "#E05252", fontSize: 13, marginTop: 18, textAlign: "center" },
    primaryButton: {
        alignItems: "center",
        backgroundColor: "#071329",
        borderRadius: 20,
        flexDirection: "row",
        height: 62,
        justifyContent: "center",
        marginTop: 28,
    },
    buttonDisabled: { opacity: 0.6 },
    buttonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800", letterSpacing: 1.2, marginRight: 10 },
    devHint: { color: "#8A91A3", fontSize: 12, marginTop: 18, textAlign: "center" },
});
