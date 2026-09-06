import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { CameraView, useCameraPermissions } from "expo-camera";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Keyboard,
    KeyboardAvoidingView,
    Linking,
    Modal,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from "react-native";
import {
    getUserFacingError,
    requestAadhaarOtp,
    verifyAadhaarOtp,
    verifyAadhaarSecureQr,
} from "./services/api";
import {
    AadhaarQrError,
    verifyAndParseAadhaarSecureQr,
} from "./services/aadhaarSecureQr";

function formatAadhaar(value) {
    return value.replace(/\D/g, "").slice(0, 12);
}

function groupAadhaar(digits) {
    return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
}

function formatDate(value) {
    const digits = value.replace(/\D/g, "").slice(0, 8);

    if (digits.length <= 2) {
        return digits;
    }

    if (digits.length <= 4) {
        return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    }

    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

export default function AadhaarVerification() {
    const { mobile, mode } = useLocalSearchParams();
    const { width } = useWindowDimensions();
    const isCompact = width < 600;

    const [aadhaarNumber, setAadhaarNumber] = useState("");
    const [fullName, setFullName] = useState("");
    const [dateOfBirth, setDateOfBirth] = useState("");
    const [consent, setConsent] = useState(false);
    const [verificationId, setVerificationId] = useState("");
    const [aadhaarOtp, setAadhaarOtp] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [formError, setFormError] = useState("");
    const [scannerOpen, setScannerOpen] = useState(false);
    const [scanLocked, setScanLocked] = useState(false);
    const [scanError, setScanError] = useState("");
    const [aadhaarLastFour, setAadhaarLastFour] = useState("");
    const [cameraPermission, requestCameraPermission] = useCameraPermissions();

    const openScanner = async () => {
        if (!consent) {
            setFormError("Select the consent checkbox before scanning your Aadhaar Secure QR.");
            return;
        }
        setFormError("");
        setScanError("");
        setScanLocked(false);
        setScannerOpen(true);
        if (!cameraPermission?.granted && cameraPermission?.canAskAgain !== false) {
            await requestCameraPermission();
        }
    };

    const handleBarcodeScanned = async ({ data, type }) => {
        if (scanLocked || type !== "qr") return;
        setScanLocked(true);
        setScanError("");

        try {
            const localData = await verifyAndParseAadhaarSecureQr(data);
            const result = await verifyAadhaarSecureQr(data.trim(), true);
            const verifiedData = result.kycData || localData;
            setAadhaarLastFour(verifiedData.aadhaarLastFour);
            setFullName(verifiedData.name);
            setDateOfBirth(verifiedData.dateOfBirth);
            setIsVerified(true);
            setScannerOpen(false);
        } catch (error) {
            setScanError(
                error instanceof AadhaarQrError
                    ? error.message
                    : getUserFacingError(error, "We could not verify this Aadhaar QR. Please try again.")
            );
        }
    };

    const handleBack = () => {
        Keyboard.dismiss();

        if (router.canGoBack()) {
            router.back();
            return;
        }

        router.replace({
            pathname: "/otp",
            params: {
                mobile: String(mobile || ""),
                mode: mode === "signin" ? "signin" : "signup",
            },
        });
    };

    const handleRequestOtp = async () => {
        if (aadhaarNumber.length !== 12) {
            setFormError("Enter a valid 12-digit Aadhaar number.");
            return;
        }

        if (!fullName.trim()) {
            setFormError("Enter your full name as shown on Aadhaar.");
            return;
        }

        if (dateOfBirth.length !== 10) {
            setFormError("Enter your date of birth in DD/MM/YYYY format.");
            return;
        }

        if (!consent) {
            setFormError("Consent is required to continue with Aadhaar e-KYC.");
            return;
        }

        Keyboard.dismiss();
        setIsLoading(true);
        setFormError("");

        try {
            const result = await requestAadhaarOtp(aadhaarNumber, consent);
            setVerificationId(result.verificationId);
        } catch (error) {
            setFormError(getUserFacingError(error));
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (aadhaarOtp.length !== 6) {
            setFormError("Enter the 6-digit OTP sent to your Aadhaar-linked mobile.");
            return;
        }

        Keyboard.dismiss();
        setIsLoading(true);
        setFormError("");

        try {
            await verifyAadhaarOtp(verificationId, aadhaarOtp);
            setIsVerified(true);
        } catch (error) {
            setFormError(getUserFacingError(error));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <Modal
                visible={scannerOpen}
                animationType="slide"
                presentationStyle="fullScreen"
                onRequestClose={() => setScannerOpen(false)}
            >
                <SafeAreaView style={styles.scannerScreen}>
                    <View style={styles.scannerHeader}>
                        <TouchableOpacity
                            onPress={() => setScannerOpen(false)}
                            style={styles.scannerClose}
                            accessibilityRole="button"
                            accessibilityLabel="Cancel Aadhaar QR scan"
                        >
                            <Ionicons name="close" size={28} color="#FFFFFF" />
                        </TouchableOpacity>
                        <Text style={styles.scannerTitle}>Scan Aadhaar Secure QR</Text>
                        <View style={styles.scannerClose} />
                    </View>

                    {cameraPermission?.granted ? (
                        <View style={styles.cameraContainer}>
                            <CameraView
                                style={StyleSheet.absoluteFill}
                                facing="back"
                                barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
                                onBarcodeScanned={scanLocked ? undefined : handleBarcodeScanned}
                                onMountError={() => setScanError("The camera could not start. Close the scanner and try again.")}
                            />
                            <View style={styles.scanFrame} />
                            <View style={styles.scanInstructions}>
                                <Text style={styles.scanInstructionsTitle}>Place the Secure QR inside the frame</Text>
                                <Text style={styles.scanInstructionsText}>Use the large QR on your downloaded or printed Aadhaar.</Text>
                            </View>
                        </View>
                    ) : (
                        <View style={styles.permissionPanel}>
                            <Ionicons name="camera-outline" size={54} color="#8C86FF" />
                            <Text style={styles.permissionTitle}>Camera access is needed</Text>
                            <Text style={styles.permissionText}>StockPe uses the camera only to read the Secure QR on your Aadhaar.</Text>
                            <TouchableOpacity
                                style={styles.permissionButton}
                                onPress={cameraPermission?.canAskAgain === false ? Linking.openSettings : requestCameraPermission}
                            >
                                <Text style={styles.permissionButtonText}>
                                    {cameraPermission?.canAskAgain === false ? "OPEN SETTINGS" : "ALLOW CAMERA"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {scanError ? (
                        <View style={styles.scanErrorPanel}>
                            <Text style={styles.scanErrorText}>{scanError}</Text>
                            <TouchableOpacity onPress={() => { setScanError(""); setScanLocked(false); }}>
                                <Text style={styles.scanRetryText}>TRY AGAIN</Text>
                            </TouchableOpacity>
                        </View>
                    ) : null}
                    {scanLocked && !scanError ? (
                        <View style={styles.scanBusy}><ActivityIndicator color="#FFFFFF" /><Text style={styles.scanBusyText}>Verifying UIDAI signature…</Text></View>
                    ) : null}
                </SafeAreaView>
            </Modal>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
                <View style={[styles.header, isCompact && styles.headerCompact]}>
                    <View style={styles.headerLeft}>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={handleBack}
                            accessibilityRole="button"
                            accessibilityLabel="Go back"
                        >
                            <Ionicons
                                name="chevron-back"
                                size={26}
                                color="#657189"
                            />
                        </TouchableOpacity>

                        <View>
                            <Text style={styles.headerTitle}>
                                Aadhaar Verification
                            </Text>
                            <Text style={styles.headerSubtitle}>Step 2 of 4</Text>
                        </View>
                    </View>

                    <View style={styles.stepBadge}>
                        <Text style={styles.stepBadgeText}>2/4</Text>
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

                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={[
                        styles.scrollContent,
                        isCompact && styles.scrollContentCompact,
                    ]}
                    keyboardShouldPersistTaps="handled"
                    keyboardDismissMode={
                        Platform.OS === "ios" ? "interactive" : "on-drag"
                    }
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.notice}>
                        <Ionicons name="finger-print" size={28} color="#594BFF" />
                        <View style={styles.noticeText}>
                            <Text style={styles.noticeTitle}>Aadhaar e-KYC</Text>
                            <Text style={styles.noticeSubtitle}>
                                OTP will be sent to your Aadhaar-linked mobile for verification.
                            </Text>
                        </View>
                    </View>

                    {!verificationId ? (
                        <>
                            <View style={styles.scanCard}>
                                <View style={styles.scanHeader}>
                                    <Text style={styles.label}>AADHAAR CARD</Text>
                                    <TouchableOpacity
                                        style={styles.scanButton}
                                        onPress={openScanner}
                                    >
                                        <Ionicons
                                            name="scan-outline"
                                            size={18}
                                            color="#594BFF"
                                        />
                                        <Text style={styles.scanButtonText}>Tap to Scan</Text>
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.scanArea}>
                                    <Text style={styles.scanText}>
                                        {aadhaarLastFour
                                            ? `UIDAI-verified Aadhaar •••• ${aadhaarLastFour}`
                                            : "Scan QR code on Aadhaar card"}
                                    </Text>
                                </View>
                            </View>

                            <Text style={styles.label}>AADHAAR NUMBER</Text>
                            <TextInput
                                style={styles.input}
                                value={aadhaarLastFour ? `XXXX XXXX ${aadhaarLastFour}` : groupAadhaar(aadhaarNumber)}
                                onChangeText={(value) => {
                                    setAadhaarNumber(formatAadhaar(value));
                                    setFormError("");
                                }}
                                placeholder="XXXX   XXXX   XXXX"
                                placeholderTextColor="#C2C8D6"
                                keyboardType="number-pad"
                                maxLength={14}
                                editable={!aadhaarLastFour}
                                autoFocus={!aadhaarLastFour}
                            />

                            <Text style={styles.label}>FULL NAME (AS ON AADHAAR)</Text>
                            <TextInput
                                style={styles.input}
                                value={fullName}
                                onChangeText={(value) => {
                                    setFullName(value.toUpperCase());
                                    setFormError("");
                                }}
                                placeholder="ARJUN KUMAR"
                                placeholderTextColor="#C2C8D6"
                                autoCapitalize="characters"
                                autoCorrect={false}
                                autoComplete="off"
                                spellCheck={false}
                                textContentType="none"
                                importantForAutofill="no"
                                keyboardType={Platform.OS === "android" ? "visible-password" : "default"}
                                editable={!aadhaarLastFour}
                            />

                            <Text style={styles.label}>DATE OF BIRTH</Text>
                            <TextInput
                                style={styles.input}
                                value={dateOfBirth}
                                onChangeText={(value) => {
                                    setDateOfBirth(formatDate(value));
                                    setFormError("");
                                }}
                                placeholder="dd/mm/yyyy"
                                placeholderTextColor="#172033"
                                keyboardType="number-pad"
                                maxLength={10}
                                editable={!aadhaarLastFour}
                            />

                            <TouchableOpacity
                                style={styles.consentRow}
                                onPress={() => {
                                    setConsent((current) => !current);
                                    setFormError("");
                                }}
                                accessibilityRole="checkbox"
                                accessibilityState={{ checked: consent }}
                            >
                                <View
                                    style={[
                                        styles.checkbox,
                                        consent && styles.checkboxChecked,
                                    ]}
                                >
                                    {consent ? (
                                        <Ionicons
                                            name="checkmark"
                                            size={16}
                                            color="#FFFFFF"
                                        />
                                    ) : null}
                                </View>
                                <Text style={styles.consentText}>
                                    I consent to Aadhaar authentication for this KYC verification.
                                </Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <View style={styles.otpSection}>
                            <View style={styles.otpIcon}>
                                <Ionicons
                                    name={isVerified ? "checkmark" : "shield-checkmark-outline"}
                                    size={34}
                                    color={isVerified ? "#FFFFFF" : "#594BFF"}
                                />
                            </View>
                            <Text style={styles.otpTitle}>
                                {isVerified ? "Aadhaar Verified" : "Enter Aadhaar OTP"}
                            </Text>
                            <Text style={styles.otpSubtitle}>
                                {isVerified
                                    ? "Your Aadhaar e-KYC has been completed successfully."
                                    : "Enter the OTP sent to your Aadhaar-linked mobile number."}
                            </Text>

                            {!isVerified ? (
                                <TextInput
                                    style={[styles.input, styles.otpInput]}
                                    value={aadhaarOtp}
                                    onChangeText={(value) => {
                                        setAadhaarOtp(
                                            value.replace(/\D/g, "").slice(0, 6)
                                        );
                                        setFormError("");
                                    }}
                                    placeholder="6-digit OTP"
                                    placeholderTextColor="#C2C8D6"
                                    keyboardType="number-pad"
                                    maxLength={6}
                                    textAlign="center"
                                />
                            ) : null}
                        </View>
                    )}

                    {formError ? (
                        <Text style={styles.errorText}>{formError}</Text>
                    ) : null}

                    {!isVerified ? (
                        <TouchableOpacity
                            style={[
                                styles.primaryButton,
                                isLoading && styles.primaryButtonDisabled,
                            ]}
                            disabled={isLoading}
                            onPress={
                                verificationId ? handleVerifyOtp : handleRequestOtp
                            }
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <>
                                    <Text style={styles.primaryButtonText}>
                                        {verificationId
                                            ? "VERIFY AADHAAR OTP"
                                            : "SEND AADHAAR OTP"}
                                    </Text>
                                    <Ionicons
                                        name="arrow-forward"
                                        size={24}
                                        color="#FFFFFF"
                                    />
                                </>
                            )}
                        </TouchableOpacity>
                    ) : null}
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#F4F6FF",
    },
    container: {
        flex: 1,
    },
    header: {
        minHeight: 92,
        paddingHorizontal: 28,
        backgroundColor: "#FFFFFF",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    headerCompact: {
        paddingHorizontal: 16,
    },
    headerLeft: {
        flexDirection: "row",
        alignItems: "center",
        flexShrink: 1,
    },
    backButton: {
        width: 42,
        height: 42,
        borderRadius: 21,
        marginRight: 14,
        backgroundColor: "#EEF1FB",
        borderWidth: 1,
        borderColor: "#E0E5F1",
        alignItems: "center",
        justifyContent: "center",
    },
    headerTitle: {
        color: "#071329",
        fontSize: 20,
        fontWeight: "900",
    },
    headerSubtitle: {
        marginTop: 3,
        color: "#737D91",
        fontSize: 13,
    },
    stepBadge: {
        marginLeft: 10,
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 18,
        backgroundColor: "#EEF1FB",
        borderWidth: 1,
        borderColor: "#E0E5F1",
    },
    stepBadgeText: {
        color: "#657189",
        fontSize: 12,
        fontWeight: "700",
    },
    progressTrack: {
        height: 3,
        backgroundColor: "#E5E8F1",
    },
    progress: {
        width: "50%",
        height: "100%",
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 24,
        paddingBottom: 36,
    },
    scrollContentCompact: {
        padding: 16,
        paddingBottom: 24,
    },
    notice: {
        minHeight: 76,
        paddingHorizontal: 20,
        borderRadius: 16,
        backgroundColor: "#FFFFFF",
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
        shadowColor: "#071329",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    noticeText: {
        flex: 1,
        marginLeft: 16,
    },
    noticeTitle: {
        color: "#071329",
        fontSize: 16,
        fontWeight: "800",
    },
    noticeSubtitle: {
        color: "#657189",
        fontSize: 13,
        lineHeight: 18,
        marginTop: 3,
    },
    scanCard: {
        padding: 20,
        borderRadius: 16,
        backgroundColor: "#FFFFFF",
        borderTopWidth: 1,
        borderTopColor: "#665CFF",
        marginBottom: 24,
    },
    scanHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 16,
    },
    scanButton: {
        minHeight: 36,
        paddingHorizontal: 14,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: "#8C86FF",
        flexDirection: "row",
        alignItems: "center",
        gap: 7,
    },
    scanButtonText: {
        color: "#594BFF",
        fontSize: 13,
        fontWeight: "700",
    },
    scanArea: {
        minHeight: 74,
        borderRadius: 12,
        borderWidth: 1.5,
        borderStyle: "dashed",
        borderColor: "#C6CEFF",
        backgroundColor: "#F6F7FF",
        alignItems: "center",
        justifyContent: "center",
        padding: 12,
    },
    scanText: {
        color: "#657189",
        fontSize: 13,
    },
    scannerScreen: { flex: 1, backgroundColor: "#071329" },
    scannerHeader: { height: 68, paddingHorizontal: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    scannerClose: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
    scannerTitle: { color: "#FFFFFF", fontSize: 18, fontWeight: "800" },
    cameraContainer: { flex: 1, overflow: "hidden", alignItems: "center", justifyContent: "center" },
    scanFrame: { width: "78%", aspectRatio: 1, borderWidth: 3, borderColor: "#FFFFFF", borderRadius: 24 },
    scanInstructions: { position: "absolute", bottom: 42, left: 24, right: 24, padding: 18, borderRadius: 16, backgroundColor: "rgba(7,19,41,0.82)" },
    scanInstructionsTitle: { color: "#FFFFFF", textAlign: "center", fontSize: 16, fontWeight: "800" },
    scanInstructionsText: { color: "#DCE2F2", textAlign: "center", marginTop: 6, lineHeight: 19 },
    permissionPanel: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32 },
    permissionTitle: { color: "#FFFFFF", fontSize: 22, fontWeight: "900", marginTop: 18 },
    permissionText: { color: "#BFC8DA", textAlign: "center", lineHeight: 21, marginTop: 10, maxWidth: 340 },
    permissionButton: { marginTop: 24, borderRadius: 24, backgroundColor: "#665CFF", paddingHorizontal: 24, paddingVertical: 14 },
    permissionButtonText: { color: "#FFFFFF", fontWeight: "800" },
    scanErrorPanel: { position: "absolute", bottom: 28, left: 20, right: 20, borderRadius: 16, backgroundColor: "#FFF0F0", padding: 18 },
    scanErrorText: { color: "#8E2929", textAlign: "center", lineHeight: 20 },
    scanRetryText: { color: "#594BFF", textAlign: "center", fontWeight: "900", marginTop: 12 },
    scanBusy: { position: "absolute", bottom: 32, alignSelf: "center", flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "rgba(7,19,41,0.9)", paddingHorizontal: 18, paddingVertical: 14, borderRadius: 24 },
    scanBusyText: { color: "#FFFFFF", fontWeight: "700" },
    label: {
        color: "#657189",
        fontSize: 11,
        fontWeight: "700",
        marginBottom: 8,
    },
    input: {
        width: "100%",
        minHeight: 58,
        borderRadius: 16,
        backgroundColor: "#FFFFFF",
        color: "#071329",
        fontSize: 17,
        paddingHorizontal: 18,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: "#ECEEF5",
    },
    consentRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: 20,
    },
    checkbox: {
        width: 22,
        height: 22,
        borderRadius: 6,
        borderWidth: 1.5,
        borderColor: "#B8BFCE",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 10,
    },
    checkboxChecked: {
        backgroundColor: "#594BFF",
        borderColor: "#594BFF",
    },
    consentText: {
        flex: 1,
        color: "#657189",
        fontSize: 13,
        lineHeight: 19,
    },
    errorText: {
        color: "#C73D3D",
        backgroundColor: "#FFF0F0",
        borderRadius: 12,
        fontSize: 13,
        lineHeight: 19,
        padding: 12,
        marginBottom: 16,
        textAlign: "center",
    },
    primaryButton: {
        minHeight: 64,
        borderRadius: 18,
        backgroundColor: "#5747EE",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        shadowColor: "#5747EE",
        shadowOffset: { width: 0, height: 7 },
        shadowOpacity: 0.22,
        shadowRadius: 12,
        elevation: 5,
    },
    primaryButtonDisabled: {
        opacity: 0.55,
    },
    primaryButtonText: {
        color: "#FFFFFF",
        fontSize: 17,
        fontWeight: "900",
    },
    otpSection: {
        alignItems: "center",
        paddingVertical: 36,
    },
    otpIcon: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: "#ECEAFF",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 18,
    },
    otpTitle: {
        color: "#071329",
        fontSize: 25,
        fontWeight: "900",
        textAlign: "center",
    },
    otpSubtitle: {
        maxWidth: 420,
        color: "#657189",
        fontSize: 14,
        lineHeight: 20,
        textAlign: "center",
        marginTop: 7,
        marginBottom: 24,
    },
    otpInput: {
        maxWidth: 320,
        fontSize: 22,
        letterSpacing: 0,
    },
});
