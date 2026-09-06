import { useState } from "react";

import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
    getUserFacingError,
    signIn,
    signUp,
} from "../services/api";

export default function AuthForm({
    activeTab,

    mobile,
    setMobile,

    password,
    setPassword,

    confirmPassword,
    setConfirmPassword,

    showPassword,
    setShowPassword,

    showConfirmPassword,
    setShowConfirmPassword,

    agreeTerms,
    setAgreeTerms,
}) {

    const [isLoading, setIsLoading] = useState(false);
    
    // ============================================
    // ERROR STATES
    // ============================================

    const [mobileError, setMobileError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    // A field is "touched" once the user has typed in it or left it, so
    // validation messages appear on blur instead of only on submit.
    const [touched, setTouched] = useState({
        mobile: false,
        password: false,
        confirmPassword: false,
    });
    const [confirmPasswordError, setConfirmPasswordError] =
        useState("");
    const [termsError, setTermsError] = useState("");
    const [apiError, setApiError] = useState("");


    // ============================================
    // MOBILE VALIDATION
    // ============================================

    const validateMobile = () => {

        if (!mobile.trim()) {
            setMobileError("Mobile number is required.");
            return false;
        }

        if (mobile.length !== 10) {
            setMobileError(
                "Enter a valid 10-digit mobile number."
            );
            return false;
        }

        setMobileError("");
        return true;
    };


    // ============================================
    // PASSWORD VALIDATION
    // ============================================

    const validatePassword = () => {

        if (!password.trim()) {
            setPasswordError("Password is required.");
            return false;
        }

        if (password.length < 8) {
            setPasswordError(
                "Password must be at least 8 characters."
            );
            return false;
        }

        setPasswordError("");
        return true;
    };


    // ============================================
    // CONFIRM PASSWORD VALIDATION
    // ============================================

    const validateConfirmPassword = () => {

        if (!confirmPassword.trim()) {
            setConfirmPasswordError(
                "Confirm password is required."
            );
            return false;
        }

        if (password !== confirmPassword) {
            setConfirmPasswordError(
                "Passwords do not match."
            );
            return false;
        }

        setConfirmPasswordError("");
        return true;
    };


    // ============================================
    // TERMS VALIDATION
    // ============================================

    const validateTerms = () => {

        if (!agreeTerms) {
            setTermsError(
                "Please agree to the Terms & Conditions and Privacy Policy."
            );
            return false;
        }

        setTermsError("");
        return true;
    };


    // ============================================
    // SIGN IN
    // ============================================

    const handleSignIn = async () => {

        const mobileValid = validateMobile();
        const passwordValid = validatePassword();

        if (!mobileValid || !passwordValid) {
            return;
        }

        setIsLoading(true);
        setApiError("");

        try {
            await signIn(mobile, password);
            router.push({
                pathname: "/otp",
                params: {
                    mobile: mobile,
                    mode: "signin",
                },
            });
        } catch (error) {
            setApiError(getUserFacingError(error));
        } finally {
            setIsLoading(false);
        }

    };

    // ============================================
    // SIGN UP
    // ============================================

    const handleSignUp = async () => {

        const mobileValid = validateMobile();
        const passwordValid = validatePassword();

        const confirmPasswordValid =
            validateConfirmPassword();

        const termsValid = validateTerms();

        if (
            !mobileValid ||
            !passwordValid ||
            !confirmPasswordValid ||
            !termsValid
        ) {
            return;
        }

        setIsLoading(true);
        setApiError("");

        try {
            await signUp(mobile, password);
            router.push({
                pathname: "/otp",
                params: {
                    mobile: mobile,
                    mode: "signup",
                },
            });
        } catch (error) {
            setApiError(getUserFacingError(error));
        } finally {
            setIsLoading(false);
        }
    };

    // ============================================
    // MOBILE CHANGE
    // ============================================

    const handleMobileChange = (text) => {

        const onlyNumbers = text.replace(
            /[^0-9]/g,
            ""
        );

        setMobile(onlyNumbers);
        setApiError("");
        setTouched((current) => ({ ...current, mobile: true }));

        // Remove error while user corrects input
        if (mobileError) {
            setMobileError("");
        }
    };

    const handleMobileBlur = () => {
        if (touched.mobile) validateMobile();
    };


    // ============================================
    // PASSWORD CHANGE
    // ============================================

    const handlePasswordChange = (text) => {

        setPassword(text);
        setApiError("");
        setTouched((current) => ({ ...current, password: true }));

        if (passwordError) {
            setPasswordError("");
        }
    };

    const handlePasswordBlur = () => {
        if (!touched.password) return;
        validatePassword();

        // Re-check the confirmation too, since it compares against this value.
        if (touched.confirmPassword && confirmPassword) {
            validateConfirmPassword();
        }
    };


    // ============================================
    // CONFIRM PASSWORD CHANGE
    // ============================================

    const handleConfirmPasswordChange = (text) => {

        setConfirmPassword(text);
        setApiError("");
        setTouched((current) => ({ ...current, confirmPassword: true }));

        if (confirmPasswordError) {
            setConfirmPasswordError("");
        }
    };

    const handleConfirmPasswordBlur = () => {
        if (touched.confirmPassword) validateConfirmPassword();
    };


    // ============================================
    // TERMS CHANGE
    // ============================================

    const handleTermsChange = () => {

        const newValue = !agreeTerms;

        setAgreeTerms(newValue);

        if (newValue) {
            setTermsError("");
        }
    };


    return (
        <>

            {/* ============================================
                SIGN IN
            ============================================ */}

            {activeTab === "signin" && (
                <>
                    {apiError ? (
                        <Text style={styles.apiErrorText}>{apiError}</Text>
                    ) : null}
                    {/* MOBILE NUMBER */}

                    <Text style={styles.label}>
                        MOBILE NUMBER
                    </Text>

                    <View
                        style={[
                            styles.inputContainer,
                            mobileError &&
                                styles.inputError,
                        ]}
                    >

                        <Text style={styles.countryCode}>
                            +91
                        </Text>

                        <View style={styles.verticalLine} />

                        <TextInput
                            style={styles.input}
                            placeholder="98765 43210"
                            placeholderTextColor="#AEB5C7"
                            keyboardType="phone-pad"
                            maxLength={10}
                            value={mobile}
                            onChangeText={
                                handleMobileChange
                            }
                            onBlur={handleMobileBlur}
                        />

                        <Ionicons
                            name="call-outline"
                            size={22}
                            color="#657189"
                        />

                    </View>

                    {mobileError ? (
                        <Text style={styles.errorText}>
                            {mobileError}
                        </Text>
                    ) : null}


                    {/* PASSWORD */}

                    <Text style={styles.label}>
                        PASSWORD
                    </Text>

                    <View
                        style={[
                            styles.inputContainer,
                            passwordError &&
                                styles.inputError,
                        ]}
                    >

                        <Ionicons
                            name="lock-closed-outline"
                            size={21}
                            color="#657189"
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Min. 8 characters"
                            placeholderTextColor="#AEB5C7"
                            secureTextEntry={!showPassword}
                            value={password}
                            onChangeText={
                                handlePasswordChange
                            }
                            onBlur={handlePasswordBlur}
                        />

                        <TouchableOpacity
                            onPress={() =>
                                setShowPassword(
                                    !showPassword
                                )
                            }
                        >
                            <Ionicons
                                name={
                                    showPassword
                                        ? "eye-outline"
                                        : "eye-off-outline"
                                }
                                size={22}
                                color="#657189"
                            />
                        </TouchableOpacity>

                    </View>

                    {passwordError ? (
                        <Text style={styles.errorText}>
                            {passwordError}
                        </Text>
                    ) : null}


                    {/* SEND OTP */}

                    <TouchableOpacity
                        style={[
                            styles.otpButton,
                            isLoading && styles.otpButtonDisabled,
                        ]}
                        onPress={handleSignIn}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <ActivityIndicator
                                    size="small"
                                    color="#FFFFFF"
                                />

                                <Text style={styles.otpText}>
                                    Sending...
                                </Text>
                            </>
                        ) : (
                            <>
                                <Text style={styles.otpText}>
                                    SEND OTP
                                </Text>

                                <Ionicons
                                    name="arrow-forward"
                                    size={28}
                                    color="#FFFFFF"
                                    style={styles.otpArrow}
                                />
                            </>
                        )}
                    </TouchableOpacity>
                </>
            )}


            {/* ============================================
                SIGN UP
            ============================================ */}

            {activeTab === "signup" && (
                <>
                    {apiError ? (
                        <Text style={styles.apiErrorText}>{apiError}</Text>
                    ) : null}
                    {/* MOBILE NUMBER */}

                    <Text style={styles.label}>
                        MOBILE NUMBER
                    </Text>

                    <View
                        style={[
                            styles.inputContainer,
                            mobileError &&
                                styles.inputError,
                        ]}
                    >

                        <Text style={styles.countryCode}>
                            +91
                        </Text>

                        <View style={styles.verticalLine} />

                        <TextInput
                            style={styles.input}
                            placeholder="98765 43210"
                            placeholderTextColor="#AEB5C7"
                            keyboardType="phone-pad"
                            maxLength={10}
                            value={mobile}
                            onChangeText={
                                handleMobileChange
                            }
                            onBlur={handleMobileBlur}
                        />

                        <Ionicons
                            name="call-outline"
                            size={22}
                            color="#657189"
                        />

                    </View>

                    {mobileError ? (
                        <Text style={styles.errorText}>
                            {mobileError}
                        </Text>
                    ) : null}


                    {/* PASSWORD */}

                    <Text style={styles.label}>
                        PASSWORD
                    </Text>

                    <View
                        style={[
                            styles.inputContainer,
                            passwordError &&
                                styles.inputError,
                        ]}
                    >

                        <Ionicons
                            name="lock-closed-outline"
                            size={21}
                            color="#657189"
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Create a password"
                            placeholderTextColor="#AEB5C7"
                            secureTextEntry={!showPassword}
                            value={password}
                            onChangeText={
                                handlePasswordChange
                            }
                            onBlur={handlePasswordBlur}
                        />

                        <TouchableOpacity
                            onPress={() =>
                                setShowPassword(
                                    !showPassword
                                )
                            }
                        >
                            <Ionicons
                                name={
                                    showPassword
                                        ? "eye-outline"
                                        : "eye-off-outline"
                                }
                                size={22}
                                color="#657189"
                            />
                        </TouchableOpacity>

                    </View>

                    {passwordError ? (
                        <Text style={styles.errorText}>
                            {passwordError}
                        </Text>
                    ) : null}


                    {/* CONFIRM PASSWORD */}

                    <Text style={styles.label}>
                        CONFIRM PASSWORD
                    </Text>

                    <View
                        style={[
                            styles.inputContainer,
                            confirmPasswordError &&
                                styles.inputError,
                        ]}
                    >

                        <Ionicons
                            name="lock-closed-outline"
                            size={21}
                            color="#657189"
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Confirm your password"
                            placeholderTextColor="#AEB5C7"
                            secureTextEntry={
                                !showConfirmPassword
                            }
                            value={confirmPassword}
                            onChangeText={
                                handleConfirmPasswordChange
                            }
                            onBlur={handleConfirmPasswordBlur}
                        />

                        <TouchableOpacity
                            onPress={() =>
                                setShowConfirmPassword(
                                    !showConfirmPassword
                                )
                            }
                        >
                            <Ionicons
                                name={
                                    showConfirmPassword
                                        ? "eye-outline"
                                        : "eye-off-outline"
                                }
                                size={22}
                                color="#657189"
                            />
                        </TouchableOpacity>

                    </View>

                    {confirmPasswordError ? (
                        <Text style={styles.errorText}>
                            {confirmPasswordError}
                        </Text>
                    ) : null}


                    {/* TERMS */}

                    <TouchableOpacity
                        style={styles.termsContainer}
                        onPress={handleTermsChange}
                    >

                        <View
                            style={[
                                styles.checkbox,
                                agreeTerms &&
                                    styles.checkboxActive,
                            ]}
                        >

                            {agreeTerms && (
                                <Ionicons
                                    name="checkmark"
                                    size={17}
                                    color="#FFFFFF"
                                />
                            )}

                        </View>

                        <Text style={styles.termsText}>
                            I agree to the{" "}
                            <Text style={styles.termsLink}>
                                Terms & Conditions
                            </Text>{" "}
                            and{" "}
                            <Text style={styles.termsLink}>
                                Privacy Policy
                            </Text>
                        </Text>

                    </TouchableOpacity>

                    {termsError ? (
                        <Text style={styles.errorText}>
                            {termsError}
                        </Text>
                    ) : null}


                    {/* CREATE ACCOUNT */}

                <TouchableOpacity
                    style={[
                        styles.otpButton,
                        isLoading && styles.otpButtonDisabled,
                    ]}
                    onPress={handleSignUp}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <ActivityIndicator
                                size="small"
                                color="#FFFFFF"
                            />

                            <Text style={styles.otpText}>
                                Creating Account...
                            </Text>
                        </>
                    ) : (
                        <>
                            <Text style={styles.otpText}>
                                CREATE ACCOUNT
                            </Text>

                            <Ionicons
                                name="arrow-forward"
                                size={28}
                                color="#FFFFFF"
                                style={styles.otpArrow}
                            />
                        </>
                    )}
                </TouchableOpacity>

                </>
            )}

        </>
    );
}


const styles = StyleSheet.create({

    label: {
        fontSize: 12,
        letterSpacing: 2.2,
        color: "#737D91",
        marginBottom: 10,
    },

    inputContainer: {
        height: 64,
        borderRadius: 20,
        backgroundColor: "#EEF1FB",

        borderWidth: 1,
        borderColor: "#DDE2F0",

        flexDirection: "row",
        alignItems: "center",

        paddingHorizontal: 18,
        marginBottom: 24,
    },

    inputError: {
        borderColor: "#E05252",
    },

    errorText: {
        fontSize: 12,
        color: "#E05252",
        marginTop: -18,
        marginBottom: 18,
        paddingHorizontal: 4,
    },

    apiErrorText: {
        color: "#C73D3D",
        backgroundColor: "#FFF0F0",
        borderRadius: 12,
        fontSize: 13,
        lineHeight: 19,
        marginBottom: 18,
        padding: 12,
    },

    countryCode: {
        fontSize: 16,
        color: "#657189",
    },

    verticalLine: {
        width: 1,
        height: 28,
        backgroundColor: "#D1D6E3",
        marginHorizontal: 14,
    },

    input: {
        flex: 1,
        fontSize: 17,
        color: "#18233B",
        paddingHorizontal: 12,
    },

    otpButton: {
        height: 64,
        backgroundColor: "#00C987",
        borderRadius: 20,

        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",

        marginTop: 3,

        shadowColor: "#00C987",
        shadowOffset: {
            width: 0,
            height: 7,
        },
        shadowOpacity: 0.25,
        shadowRadius: 12,

        elevation: 6,
    },

    otpButtonDisabled: {
        opacity: 0.5,
    },

    otpText: {
        color: "#FFFFFF",
        fontSize: 18,
        fontWeight: "900",
    },

    otpArrow: {
        marginLeft: 12,
    },

    termsContainer: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginTop: 0,
        marginBottom: 25,
    },

    checkbox: {
        width: 22,
        height: 22,
        borderRadius: 7,

        borderWidth: 1.5,
        borderColor: "#CBD1DF",

        alignItems: "center",
        justifyContent: "center",

        marginRight: 10,
    },

    checkboxActive: {
        backgroundColor: "#00C987",
        borderColor: "#00C987",
    },

    termsText: {
        flex: 1,
        fontSize: 13,
        lineHeight: 20,
        color: "#737D91",
    },

    termsLink: {
        color: "#00A875",
        fontWeight: "700",
    },

});
