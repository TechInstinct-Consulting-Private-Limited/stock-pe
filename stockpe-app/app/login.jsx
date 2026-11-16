import { router } from "expo-router";
import { useRef, useState } from "react";
import { Alert, Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AlternativeAuth from "../src/components/AlternativeAuth";
import AuthForm from "../src/components/AuthForm";
import AuthHeader from "../src/components/AuthHeader.jsx";
import { continueMobileAuth, getUserFacingError, prepareMsg91Otp } from "../src/services/api";
import { ensureDeviceId, setLastActiveMobile } from "../src/services/authStorage";

export default function Login() {
    const [mobile, setMobile] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState("");
    const scrollRef = useRef(null);

    const continueWithMobile = async () => {
        Keyboard.dismiss(); setIsLoading(true); setApiError("");
        try {
            const deviceId = await ensureDeviceId();
            const decision = await continueMobileAuth(mobile, deviceId);
            if (decision?.next === "MPIN") {
                await setLastActiveMobile(mobile);
                router.push({ pathname: "/mpin-unlock", params: { mobile } });
                return;
            }
            const result = await prepareMsg91Otp(mobile, decision?.purpose || "signup");
            const requestId = String(result?.requestId || "");
            if (!requestId) throw new Error("OTP service did not return a verification request. Please try again.");
            router.push({ pathname: "/otp", params: { mobile, mode: decision?.purpose || "signup", provider: "msg91", requestId } });
        } catch (error) {
            const message = getUserFacingError(error); setApiError(message); Alert.alert("Unable to continue", message);
        } finally { setIsLoading(false); }
    };

    return <SafeAreaView edges={["top", "bottom", "left", "right"]} style={styles.container}>
        <AuthHeader />
        <KeyboardAvoidingView style={styles.formContainer} behavior={Platform.OS === "ios" ? "padding" : "height"}>
            <View style={styles.formSheet}><ScrollView ref={scrollRef} style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"} automaticallyAdjustKeyboardInsets={Platform.OS === "ios"}>
                <View style={styles.loginSection}><AuthForm onContinue={continueWithMobile} isLoading={isLoading} apiError={apiError} mobile={mobile} setMobile={(value) => { setMobile(value); setApiError(""); }} /><AlternativeAuth /></View>
            </ScrollView></View>
        </KeyboardAvoidingView>
    </SafeAreaView>;
}

const styles = StyleSheet.create({ container:{flex:1,backgroundColor:"#FFFFFF"},formContainer:{flex:1},formSheet:{flex:1,backgroundColor:"#FFFFFF",borderTopLeftRadius:28,borderTopRightRadius:28,overflow:"hidden"},scrollView:{flex:1},scrollContent:{flexGrow:1,paddingBottom:30},loginSection:{backgroundColor:"#FFFFFF",paddingHorizontal:24,paddingTop:26,paddingBottom:8} });
