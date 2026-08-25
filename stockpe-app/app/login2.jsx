import { useRef, useState } from "react";

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
    View
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";



import BrandLogo from "./components/BrandLogo";

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

  const switchTab = (tab) => {

        // Close keyboard immediately
        Keyboard.dismiss();   

        setActiveTab(tab);

        // Clear form fields
        setMobile("");
        setPassword("");
        setConfirmPassword("");

        // Reset password visibility
        setShowPassword(false);
        setShowConfirmPassword(false);

        // Reset terms checkbox
        setAgreeTerms(false);

        // Move form back to the top
        scrollRef.current?.scrollTo({
            y: 0,
            animated: false,
        });
    };

  return (
    <SafeAreaView style={styles.container}>

        <KeyboardAvoidingView
            style={styles.keyboardContainer}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >

            <ScrollView
                ref={scrollRef}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
                contentContainerStyle={styles.scrollContent}
            >

                {/* ================= TOP SECTION ================= */}

                <LinearGradient
                colors={["#071B2D", "#10264D", "#1B3565"]}
                style={styles.topSection}
                >

                {/* Logo */}

                <BrandLogo size="small" />

                {/* Brand */}

                <Text style={styles.brand}>
                    STOCKPE
                </Text>

                <Text style={styles.subtitle}>
                    India's #1 Stock Prediction Market
                </Text>

                {/* Stats */}

                <View style={styles.statsContainer}>

                    <View style={styles.stat}>
                    <Text
                        style={[
                        styles.statValue,
                        styles.green,
                        ]}
                    >
                        ₹49.5L
                    </Text>

                    <Text style={styles.statLabel}>
                        Prize Pool
                    </Text>
                    </View>

                    <View style={styles.stat}>
                    <Text
                        style={[
                        styles.statValue,
                        styles.blue,
                        ]}
                    >
                        2.1M+
                    </Text>

                    <Text style={styles.statLabel}>
                        Players
                    </Text>
                    </View>

                    <View style={styles.stat}>
                    <Text
                        style={[
                        styles.statValue,
                        styles.yellow,
                        ]}
                    >
                        4.8★
                    </Text>

                    <Text style={styles.statLabel}>
                        Rating
                    </Text>
                    </View>

                </View>

                </LinearGradient>


                {/* ================= LOGIN SECTION ================= */}

                <View style={styles.loginSection}>

                {/* ================= SIGN IN / SIGN UP TABS ================= */}

                <View style={styles.tabs}>

                    {/* SIGN IN */}

                    <TouchableOpacity
                    style={[
                        styles.tab,
                        activeTab === "signin" &&
                        styles.activeTab,
                    ]}
                    onPress={() =>
                        switchTab("signin")
                    }
                    >
                    <Text
                        style={[
                        styles.tabText,
                        activeTab === "signin" &&
                            styles.activeTabText,
                        ]}
                    >
                        SIGN IN
                    </Text>
                    </TouchableOpacity>


                    {/* SIGN UP */}

                    <TouchableOpacity
                    style={[
                        styles.tab,
                        activeTab === "signup" &&
                        styles.activeTab,
                    ]}
                    onPress={() =>
                        switchTab("signup")
                    }
                    >
                    <Text
                        style={[
                        styles.tabText,
                        activeTab === "signup" &&
                            styles.activeTabText,
                        ]}
                    >
                        SIGN UP
                    </Text>
                    </TouchableOpacity>

                </View>


                {/* ================================================= */}
                {/*                    SIGN IN FORM                   */}
                {/* ================================================= */}

                {activeTab === "signin" && (
                    <>

                    {/* MOBILE NUMBER */}

                    <Text style={styles.label}>
                        MOBILE NUMBER
                    </Text>

                    <View style={styles.inputContainer}>

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
                        onChangeText={setMobile}
                        />

                        <Ionicons
                        name="call-outline"
                        size={22}
                        color="#657189"
                        />

                    </View>


                    {/* PASSWORD */}

                    <Text style={styles.label}>
                        PASSWORD
                    </Text>

                    <View style={styles.inputContainer}>

                        <Ionicons
                        name="lock-closed-outline"
                        size={21}
                        color="#657189"
                        />

                        <TextInput
                        style={styles.input}
                        placeholder="Min. 6 characters"
                        placeholderTextColor="#AEB5C7"
                        secureTextEntry={!showPassword}
                        value={password}
                        onChangeText={setPassword}
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


                    {/* SEND OTP */}

                    <TouchableOpacity
                        style={styles.otpButton}
                    >
                        <Text style={styles.otpText}>
                        SEND OTP
                        </Text>

                        <Ionicons
                        name="arrow-forward"
                        size={28}
                        color="#FFFFFF"
                        style={styles.otpArrow}
                        />
                    </TouchableOpacity>


                    {/* OR */}

                    <View style={styles.orContainer}>

                        <View style={styles.line} />

                        <Text style={styles.orText}>
                        OR
                        </Text>

                        <View style={styles.line} />

                    </View>


                    {/* USDT WALLET */}

                    <TouchableOpacity
                        style={styles.walletButton}
                    >

                        <View style={styles.walletIcon}>
                        <Text style={styles.walletIconText}>
                            ₹
                        </Text>
                        </View>

                        <View
                        style={styles.walletTextContainer}
                        >

                        <Text style={styles.walletTitle}>
                            Continue with USDT Wallet
                        </Text>

                        <Text style={styles.walletSubtitle}>
                            Connect your crypto wallet
                        </Text>

                        </View>

                        <Ionicons
                        name="chevron-forward"
                        size={24}
                        color="#657189"
                        />

                    </TouchableOpacity>

                    </>
                )}


                {/* ================================================= */}
                {/*                    SIGN UP FORM                   */}
                {/* ================================================= */}

                {activeTab === "signup" && (
                    <>

                    {/* MOBILE NUMBER */}

                    <Text style={styles.label}>
                        MOBILE NUMBER
                    </Text>

                    <View style={styles.inputContainer}>

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
                        onChangeText={setMobile}
                        />

                        <Ionicons
                        name="call-outline"
                        size={22}
                        color="#657189"
                        />

                    </View>


                    {/* PASSWORD */}

                    <Text style={styles.label}>
                        PASSWORD
                    </Text>

                    <View style={styles.inputContainer}>

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
                        onChangeText={setPassword}
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


                    {/* CONFIRM PASSWORD */}

                    <Text style={styles.label}>
                        CONFIRM PASSWORD
                    </Text>

                    <View style={styles.inputContainer}>

                        <Ionicons
                        name="lock-closed-outline"
                        size={21}
                        color="#657189"
                        />

                        <TextInput
                        style={styles.input}
                        placeholder="Confirm your password"
                        placeholderTextColor="#AEB5C7"
                        secureTextEntry={!showConfirmPassword}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
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


                    {/* TERMS */}

                    <TouchableOpacity
                        style={styles.termsContainer}
                        onPress={() =>
                        setAgreeTerms(!agreeTerms)
                        }
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


                    {/* CREATE ACCOUNT */}

                    <TouchableOpacity
                        style={styles.otpButton}
                    >

                        <Text style={styles.otpText}>
                        CREATE ACCOUNT
                        </Text>

                        <Ionicons
                        name="arrow-forward"
                        size={28}
                        color="#FFFFFF"
                        style={styles.otpArrow}
                        />

                    </TouchableOpacity>

                    </>
                )}

                </View>

            </ScrollView>

        </KeyboardAvoidingView>

    </SafeAreaView>
  );
}


/* ================================================= */
/*                       STYLES                      */
/* ================================================= */

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  scrollContent: {
    flexGrow: 1,
  },

  keyboardContainer: {
  flex: 1,
},


  /* ================= TOP ================= */

  topSection: {
    minHeight: 355,

    alignItems: "center",

    paddingTop: 28,
    paddingBottom: 28,
  },

  brand: {
    fontSize: 46,

    fontWeight: "900",

    letterSpacing: 7,

    color: "#FFFFFF",
  },

  subtitle: {
    fontSize: 14,

    color: "#8995AA",

    marginTop: 5,
  },


  /* ================= STATS ================= */

  statsContainer: {
    flexDirection: "row",

    width: "92%",

    justifyContent: "space-between",

    marginTop: 28,
  },

  stat: {
    alignItems: "center",

    flex: 1,
  },

  statValue: {
    fontSize: 24,

    fontWeight: "800",
  },

  statLabel: {
    color: "#8993A8",

    fontSize: 13,

    marginTop: 4,
  },

  green: {
    color: "#00C987",
  },

  blue: {
    color: "#8494FF",
  },

  yellow: {
    color: "#F5C33B",
  },


  /* ================= LOGIN ================= */

  loginSection: {
    backgroundColor: "#FFFFFF",

    borderTopLeftRadius: 30,

    borderTopRightRadius: 30,

    marginTop: -1,

    paddingHorizontal: 24,

    paddingTop: 24,

    paddingBottom: 35,
  },


  /* ================= TABS ================= */

  tabs: {
    height: 65,

    backgroundColor: "#EDF0FA",

    borderRadius: 20,

    flexDirection: "row",

    padding: 5,

    marginBottom: 32,
  },

  tab: {
    flex: 1,

    borderRadius: 16,

    alignItems: "center",

    justifyContent: "center",
  },

  activeTab: {
    backgroundColor: "#00C987",

    shadowColor: "#00C987",

    shadowOffset: {
      width: 0,
      height: 5,
    },

    shadowOpacity: 0.25,

    shadowRadius: 10,

    elevation: 5,
  },

  tabText: {
    fontSize: 17,

    fontWeight: "800",

    color: "#6D7890",
  },

  activeTabText: {
    color: "#FFFFFF",
  },


  /* ================= LABEL ================= */

  label: {
    fontSize: 12,

    letterSpacing: 2.2,

    color: "#737D91",

    marginBottom: 10,
  },


  /* ================= INPUT ================= */

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


  /* ================= OTP / CREATE ACCOUNT ================= */

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

  otpText: {
    color: "#FFFFFF",

    fontSize: 18,

    fontWeight: "900",
  },

  otpArrow: {
    marginLeft: 12,
  },


  /* ================= OR ================= */

  orContainer: {
    flexDirection: "row",

    alignItems: "center",

    marginVertical: 22,
  },

  line: {
    flex: 1,

    height: 1,

    backgroundColor: "#E5E7EE",
  },

  orText: {
    marginHorizontal: 14,

    color: "#7D8493",

    fontSize: 12,
  },


  /* ================= WALLET ================= */

  walletButton: {
    minHeight: 80,

    borderRadius: 20,

    borderWidth: 1,

    borderColor: "#E5E5E5",

    flexDirection: "row",

    alignItems: "center",

    paddingHorizontal: 15,

    backgroundColor: "#FFFFFF",

    shadowColor: "#000",

    shadowOffset: {
      width: 0,
      height: 2,
    },

    shadowOpacity: 0.06,

    shadowRadius: 5,

    elevation: 2,
  },

  walletIcon: {
    width: 50,

    height: 50,

    borderRadius: 15,

    backgroundColor: "#29A27F",

    alignItems: "center",

    justifyContent: "center",
  },

  walletIconText: {
    color: "#FFFFFF",

    fontSize: 24,

    fontWeight: "bold",
  },

  walletTextContainer: {
    flex: 1,

    marginLeft: 15,
  },

  walletTitle: {
    fontSize: 17,

    fontWeight: "600",

    color: "#10192C",
  },

  walletSubtitle: {
    fontSize: 13,

    color: "#747D8E",

    marginTop: 3,
  },


  /* ================= SIGN UP TERMS ================= */

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


