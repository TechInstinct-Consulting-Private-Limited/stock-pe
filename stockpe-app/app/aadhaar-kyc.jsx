import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useRef, useState } from "react";
import {
    ActivityIndicator,
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

import {
    getUserFacingError,
    requestAadhaarOtp,
    verifyAadhaarOtp,
} from "./services/api";

const EMPTY_OTP = ["", "", "", "", "", ""];

export default function AadhaarKyc() {
    const [aadhaarNumber, setAadhaarNumber] = useState("");
    const [consent, setConsent] = useState(false);
    const [verificationId, setVerificationId] = useState("");
    const [otp, setOtp] = useState(EMPTY_OTP);
    const [isLoading, setIsLoading] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [error, setError] = useState("");
    const otpRefs = useRef([]);

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
        } catch (verificationError) {
            setError(getUserFacingError(verificationError));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
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
                            onPress={() => router.back()}
                            style={styles.backButton}
                        >
                            <Ionicons name="chevron-back" size={26} color="#657189" />
                        </TouchableOpacity>
                        <View style={styles.headerCopy}>
                            <Text style={styles.headerTitle}>Verify Aadhaar</Text>
                            <Text style={styles.headerSubtitle}>Step 3 of 4</Text>
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
                                color="#00B978"
                            />
                        </View>

                        <Text style={styles.title}>
                            {isVerified ? "Aadhaar verified" : "Complete your KYC"}
                        </Text>
                        <Text style={styles.description}>
                            {isVerified
                                ? "Your identity verification was completed successfully."
                                : verificationId
                                    ? `Enter the OTP sent to the mobile linked with Aadhaar ending ${aadhaarNumber.slice(-4)}.`
                                    : "Verify your Aadhaar using the OTP sent to its linked mobile number."}
                        </Text>

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
                                            {verificationId ? "VERIFY OTP" : "SEND AADHAAR OTP"}
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
    safeArea: { flex: 1, backgroundColor: "#F5F7FF" },
    container: { flex: 1 },
    scrollContent: { flexGrow: 1, paddingBottom: 32 },
    header: {
        alignItems: "center",
        flexDirection: "row",
        paddingHorizontal: 20,
        paddingVertical: 18,
    },
    backButton: {
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        height: 48,
        justifyContent: "center",
        width: 48,
    },
    headerCopy: { flex: 1, marginLeft: 14 },
    headerTitle: { color: "#071329", fontSize: 20, fontWeight: "800" },
    headerSubtitle: { color: "#7D8190", fontSize: 13, marginTop: 3 },
    stepBadge: {
        backgroundColor: "#E8E8FF",
        borderRadius: 15,
        paddingHorizontal: 14,
        paddingVertical: 8,
    },
    stepBadgeText: { color: "#5865D9", fontSize: 13, fontWeight: "800" },
    progressTrack: { backgroundColor: "#DFE4F2", height: 4 },
    progress: { borderRadius: 2, height: 4, width: "75%" },
    content: { flex: 1, paddingHorizontal: 24, paddingTop: 42 },
    iconCircle: {
        alignItems: "center",
        alignSelf: "center",
        backgroundColor: "#E5F9F2",
        borderRadius: 34,
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
