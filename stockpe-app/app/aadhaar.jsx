import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { CameraView, scanFromURLAsync, useCameraPermissions } from "expo-camera";
import { router, useLocalSearchParams } from "expo-router";
import { createElement, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Keyboard,
    KeyboardAvoidingView,
    Linking,
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
    getAadhaarKycStatus,
    getUserFacingError,
    requestAadhaarOtp,
    verifyAadhaarOtp,
    verifyAadhaarSecureQr,
} from "../src/services/api";
import {
    AadhaarQrError,
    verifyAndParseAadhaarSecureQr,
} from "../src/services/aadhaarSecureQr";
import WebQrScanner, { decodeQrFromImageFile } from "../src/components/WebQrScanner";

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
    const scrollRef = useRef(null);
    const consentY = useRef(0);
    const [consentHighlight, setConsentHighlight] = useState(false);
    const isWeb = Platform.OS === "web";
    const scanLockRef = useRef(false);
    const cameraRef = useRef(null);
    const [isCapturing, setIsCapturing] = useState(false);
    const [isCheckingStatus, setIsCheckingStatus] = useState(true);

    // Aadhaar KYC is one-time. If it is already verified for this account there
    // is nothing to collect here, so skip straight past this step.
    useEffect(() => {
        let cancelled = false;

        (async () => {
            try {
                const status = await getAadhaarKycStatus();
                if (cancelled) return;

                if (status?.status === "verified") {
                    router.replace({
                        pathname: "/aadhaar-kyc",
                        params: {
                            mobile: String(mobile || ""),
                            mode: mode === "signin" ? "signin" : "signup",
                            verified: "1",
                            aadhaarLastFour: String(status.aadhaarLastFour || ""),
                        },
                    });
                    return;
                }
            } catch (_error) {
                // Status is advisory only; fall back to showing the form.
            }

            if (!cancelled) setIsCheckingStatus(false);
        })();

        return () => {
            cancelled = true;
        };
    }, [mobile, mode]);

    useEffect(() => {
        if (!consentHighlight) return undefined;
        const timer = setTimeout(() => setConsentHighlight(false), 2600);
        return () => clearTimeout(timer);
    }, [consentHighlight]);

    const promptForConsent = () => {
        Keyboard.dismiss();
        setFormError("Tick the consent checkbox below to scan your Aadhaar Secure QR.");
        setConsentHighlight(true);
        scrollRef.current?.scrollTo({
            y: Math.max(consentY.current - 90, 0),
            animated: true,
        });
    };

    const openScanner = async () => {
        if (!consent) {
            promptForConsent();
            return;
        }
        setFormError("");
        setScanError("");
        scanLockRef.current = false;
        setScanLocked(false);
        setScannerOpen(true);
        if (isWeb) return;
        if (!cameraPermission?.granted && cameraPermission?.canAskAgain !== false) {
            await requestCameraPermission();
        }
    };

    const handleBarcodeScanned = async ({ data }) => {
        if (scanLockRef.current || !data) return;
        scanLockRef.current = true;
        setScanLocked(true);
        setScanError("");

        try {
            const localData = await verifyAndParseAadhaarSecureQr(data);
            let verifiedData = localData;

            try {
                const result = await verifyAadhaarSecureQr(data.trim(), true);
                verifiedData = result.kycData || localData;
            } catch (serverError) {
                // The QR signature is already verified on-device, so a server
                // hiccup should not block the user; it is retried on submit.
                console.warn("Secure QR server verification failed", serverError);
            }

            setAadhaarLastFour(verifiedData.aadhaarLastFour);
            setFullName(verifiedData.name);
            setDateOfBirth(verifiedData.dateOfBirth);
            setIsVerified(true);
            setScannerOpen(false);
        } catch (error) {
            scanLockRef.current = false;
            setScanError(
                error instanceof AadhaarQrError
                    ? error.message
                    : getUserFacingError(error, "We could not verify this Aadhaar QR. Please try again.")
            );
        }
    };

    const resetScan = () => {
        setAadhaarLastFour("");
        setFullName("");
        setDateOfBirth("");
        setIsVerified(false);
        setScanError("");
        setFormError("");
    };

    const handleImageUpload = async (event) => {
        const file = event?.target?.files?.[0];
        if (!file) return;

        setScanError("");
        try {
            const payload = await decodeQrFromImageFile(file);
            if (!payload) {
                setScanError("No QR code was found in that image. Try a sharper, closer photo.");
                return;
            }
            await handleBarcodeScanned({ data: payload });
        } catch (_error) {
            setScanError("That image could not be read. Try a different photo.");
        }
    };

    const handleCaptureAndScan = async () => {
        if (!cameraRef.current || isCapturing) return;

        setIsCapturing(true);
        setScanError("");

        try {
            const photo = await cameraRef.current.takePictureAsync({
                quality: 1,
                skipProcessing: true,
            });
            const results = await scanFromURLAsync(photo.uri, ["qr"]);
            const payload = results?.[0]?.data;

            if (!payload) {
                setScanError(
                    "No QR was found in that photo. Fill the frame with the QR, keep it flat and well lit, then capture again."
                );
                return;
            }

            await handleBarcodeScanned({ data: payload });
        } catch (_error) {
            setScanError("The photo could not be read. Please try again.");
        } finally {
            setIsCapturing(false);
        }
    };

    const handleContinue = () => {
        Keyboard.dismiss();
        router.replace({
            pathname: "/aadhaar-kyc",
            params: {
                mobile: String(mobile || ""),
                mode: mode === "signin" ? "signin" : "signup",
                verified: "1",
                aadhaarLastFour,
            },
        });
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
            router.replace({
                pathname: "/aadhaar-kyc",
                params: {
                    mobile: String(mobile || ""),
                    mode: mode === "signin" ? "signin" : "signup",
                    verificationId: result.verificationId,
                    aadhaarLastFour: aadhaarNumber.slice(-4),
                },
            });
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

    if (isCheckingStatus) {
        return (
            <SafeAreaView style={[styles.safeArea, styles.statusCheck]}>
                <ActivityIndicator color="#594BFF" size="large" />
                <Text style={styles.statusCheckText}>Checking your KYC status…</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            {scannerOpen ? (
                <SafeAreaView style={[styles.scannerScreen, styles.scannerOverlay]}>
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

                    {isWeb || cameraPermission?.granted ? (
                        <View style={styles.cameraContainer}>
                            {isWeb ? (
                                <WebQrScanner
                                    paused={scanLocked}
                                    onScan={handleBarcodeScanned}
                                    onError={setScanError}
                                />
                            ) : (
                                <CameraView
                                    ref={cameraRef}
                                    style={StyleSheet.absoluteFill}
                                    facing="back"
                                    active={scannerOpen}
                                    autofocus="on"
                                    animateShutter={false}
                                    barcodeScannerSettings={{
                                        barcodeTypes: ["qr", "pdf417", "datamatrix", "aztec"],
                                    }}
                                    onBarcodeScanned={handleBarcodeScanned}
                                    onMountError={() => setScanError("The camera could not start. Close the scanner and try again.")}
                                />
                            )}
                            <View style={styles.scanFrame} />

                            <View style={styles.shutterBar}>
                                {isWeb ? (
                                    createElement("input", {
                                        type: "file",
                                        accept: "image/*",
                                        onChange: handleImageUpload,
                                        style: { color: "#DCE2F2" },
                                    })
                                ) : (
                                    <TouchableOpacity
                                        style={styles.shutterButton}
                                        disabled={isCapturing || scanLocked}
                                        onPress={handleCaptureAndScan}
                                        accessibilityRole="button"
                                        accessibilityLabel="Capture photo and read QR"
                                    >
                                        {isCapturing ? (
                                            <ActivityIndicator color="#071329" />
                                        ) : (
                                            <View style={styles.shutterInner} />
                                        )}
                                    </TouchableOpacity>
                                )}
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
                            <TouchableOpacity onPress={() => { setScanError(""); scanLockRef.current = false; setScanLocked(false); }}>
                                <Text style={styles.scanRetryText}>TRY AGAIN</Text>
                            </TouchableOpacity>
                        </View>
                    ) : null}
                    {scanLocked && !scanError ? (
                        <View style={styles.scanBusy}><ActivityIndicator color="#FFFFFF" /><Text style={styles.scanBusyText}>Verifying UIDAI signature…</Text></View>
                    ) : null}
                </SafeAreaView>
            ) : null}
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
                    ref={scrollRef}
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
                                        style={[
                                            styles.scanButton,
                                            aadhaarLastFour && styles.scanButtonDone,
                                        ]}
                                        onPress={aadhaarLastFour ? resetScan : openScanner}
                                        accessibilityRole="button"
                                        accessibilityLabel={
                                            aadhaarLastFour
                                                ? "Scan a different Aadhaar"
                                                : "Scan Aadhaar Secure QR"
                                        }
                                    >
                                        <Ionicons
                                            name={aadhaarLastFour ? "refresh" : "scan-outline"}
                                            size={18}
                                            color={aadhaarLastFour ? "#00A66E" : "#594BFF"}
                                        />
                                        <Text
                                            style={[
                                                styles.scanButtonText,
                                                aadhaarLastFour && styles.scanButtonTextDone,
                                            ]}
                                        >
                                            {aadhaarLastFour ? "Rescan" : "Tap to Scan"}
                                        </Text>
                                    </TouchableOpacity>
                                </View>

                                {aadhaarLastFour ? (
                                    <View style={styles.scannedPanel}>
                                        <Text style={styles.scannedName}>{fullName}</Text>
                                        <Text style={styles.scannedMeta}>DOB: {dateOfBirth}</Text>
                                        <Text style={styles.scannedAadhaar}>
                                            XXXX XXXX {aadhaarLastFour}
                                        </Text>
                                        <View style={styles.scannedBadge}>
                                            <Ionicons name="shield-checkmark" size={15} color="#00A66E" />
                                            <Text style={styles.scannedBadgeText}>
                                                UIDAI signature verified
                                            </Text>
                                        </View>
                                    </View>
                                ) : (
                                    <TouchableOpacity
                                        style={styles.scanArea}
                                        onPress={openScanner}
                                        accessibilityRole="button"
                                    >
                                        <Ionicons name="qr-code-outline" size={26} color="#8C86FF" />
                                        <Text style={styles.scanText}>
                                            Scan the Secure QR on your Aadhaar card
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            </View>

                            {aadhaarLastFour ? null : (
                                <>
                            <Text style={styles.label}>AADHAAR NUMBER</Text>
                            <TextInput
                                style={styles.input}
                                value={groupAadhaar(aadhaarNumber)}
                                onChangeText={(value) => {
                                    setAadhaarNumber(formatAadhaar(value));
                                    setFormError("");
                                }}
                                placeholder="XXXX   XXXX   XXXX"
                                placeholderTextColor="#C2C8D6"
                                keyboardType="number-pad"
                                maxLength={14}
                                autoFocus
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
                            />
                                </>
                            )}

                            <TouchableOpacity
                                style={[
                                    styles.consentRow,
                                    consentHighlight && styles.consentRowHighlight,
                                ]}
                                onLayout={(event) => {
                                    consentY.current = event.nativeEvent.layout.y;
                                }}
                                onPress={() => {
                                    setConsent((current) => !current);
                                    setConsentHighlight(false);
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
                    ) : (
                        <TouchableOpacity
                            style={styles.primaryButton}
                            onPress={handleContinue}
                            accessibilityRole="button"
                        >
                            <Text style={styles.primaryButtonText}>CONTINUE</Text>
                            <Ionicons name="arrow-forward" size={24} color="#FFFFFF" />
                        </TouchableOpacity>
                    )}
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
    statusCheck: {
        alignItems: "center",
        justifyContent: "center",
        gap: 14,
    },
    statusCheckText: {
        color: "#657189",
        fontSize: 15,
        fontWeight: "600",
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
    scanButtonDone: {
        borderColor: "#7ED9B4",
        backgroundColor: "#EDFBF5",
    },
    scanButtonTextDone: {
        color: "#00A66E",
    },
    scannedPanel: {
        borderRadius: 12,
        backgroundColor: "#F5FFFA",
        borderWidth: 1,
        borderColor: "#BFEFD9",
        padding: 16,
    },
    scannedName: {
        color: "#071329",
        fontSize: 19,
        fontWeight: "800",
    },
    scannedMeta: {
        color: "#657189",
        fontSize: 14,
        marginTop: 4,
    },
    scannedAadhaar: {
        color: "#00A66E",
        fontSize: 17,
        fontWeight: "800",
        letterSpacing: 1.5,
        marginTop: 6,
    },
    scannedBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginTop: 12,
    },
    scannedBadgeText: {
        color: "#00A66E",
        fontSize: 12,
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
        gap: 8,
    },
    scanText: {
        color: "#657189",
        fontSize: 13,
    },
    scannerScreen: { flex: 1, backgroundColor: "#071329" },
    scannerOverlay: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 20,
        elevation: 20,
    },
    scannerHeader: { height: 68, paddingHorizontal: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    scannerClose: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
    scannerTitle: { color: "#FFFFFF", fontSize: 18, fontWeight: "800" },
    cameraContainer: { flex: 1, overflow: "hidden", alignItems: "center", justifyContent: "center" },
    scanFrame: { width: "78%", aspectRatio: 1, borderWidth: 3, borderColor: "#FFFFFF", borderRadius: 24 },
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
    shutterBar: {
        position: "absolute",
        bottom: 46,
        left: 0,
        right: 0,
        alignItems: "center",
    },
    shutterButton: {
        alignItems: "center",
        backgroundColor: "rgba(255,255,255,0.28)",
        borderColor: "#FFFFFF",
        borderRadius: 42,
        borderWidth: 4,
        height: 84,
        justifyContent: "center",
        width: 84,
    },
    shutterInner: {
        backgroundColor: "#FFFFFF",
        borderRadius: 31,
        height: 62,
        width: 62,
    },
    consentRowHighlight: {
        borderWidth: 1.5,
        borderColor: "#594BFF",
        backgroundColor: "#EEF0FF",
        borderRadius: 14,
        padding: 12,
        marginHorizontal: -12,
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
