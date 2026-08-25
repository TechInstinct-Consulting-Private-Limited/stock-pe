import { useState } from "react";
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import BrandLogo from "./components/BrandLogo";

export default function Signup() {
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [agreeTerms, setAgreeTerms] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >

        {/* ================= HEADER ================= */}

        <View style={styles.header}>

          <TouchableOpacity style={styles.backButton}>
            <Ionicons
              name="arrow-back"
              size={24}
              color="#18233B"
            />
          </TouchableOpacity>

          <BrandLogo size="small" />

          <View style={styles.headerSpace} />

        </View>

        {/* ================= TITLE ================= */}

        <View style={styles.titleSection}>

          <Text style={styles.title}>
            Create Your Account
          </Text>

          <Text style={styles.subtitle}>
            Join India's #1 Stock Prediction Market
          </Text>

        </View>

        {/* ================= MOBILE ================= */}

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

        {/* ================= PASSWORD ================= */}

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
              setShowPassword(!showPassword)
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

        {/* ================= CONFIRM PASSWORD ================= */}

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

        {/* ================= TERMS ================= */}

        <TouchableOpacity
          style={styles.termsContainer}
          onPress={() =>
            setAgreeTerms(!agreeTerms)
          }
        >

          <View
            style={[
              styles.checkbox,
              agreeTerms && styles.checkboxActive,
            ]}
          >
            {agreeTerms && (
              <Ionicons
                name="checkmark"
                size={18}
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

        {/* ================= CREATE ACCOUNT ================= */}

        <TouchableOpacity
          style={styles.createButton}
        >

          <Text style={styles.createButtonText}>
            CREATE ACCOUNT
          </Text>

          <Ionicons
            name="arrow-forward"
            size={27}
            color="#FFFFFF"
          />

        </TouchableOpacity>

        {/* ================= ALREADY ACCOUNT ================= */}

        <View style={styles.loginTextContainer}>

          <Text style={styles.loginText}>
            Already have an account?
          </Text>

          <TouchableOpacity>
            <Text style={styles.loginLink}>
              SIGN IN
            </Text>
          </TouchableOpacity>

        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },

  /* ================= HEADER ================= */

  header: {
    height: 110,

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",
  },

  backButton: {
    width: 45,
    height: 45,

    borderRadius: 15,

    backgroundColor: "#EEF1FB",

    alignItems: "center",
    justifyContent: "center",
  },

  headerSpace: {
    width: 45,
  },

  /* ================= TITLE ================= */

  titleSection: {
    marginTop: 15,
    marginBottom: 35,
  },

  title: {
    fontSize: 30,

    fontWeight: "900",

    color: "#071329",

    marginBottom: 8,
  },

  subtitle: {
    fontSize: 14,

    color: "#7D8493",

    lineHeight: 21,
  },

  /* ================= LABEL ================= */

  label: {
    fontSize: 12,

    letterSpacing: 2,

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

  /* ================= TERMS ================= */

  termsContainer: {
    flexDirection: "row",

    alignItems: "flex-start",

    marginTop: 2,

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

  /* ================= BUTTON ================= */

  createButton: {
    height: 64,

    backgroundColor: "#00C987",

    borderRadius: 20,

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "center",

    shadowColor: "#00C987",

    shadowOffset: {
      width: 0,

      height: 7,
    },

    shadowOpacity: 0.25,

    shadowRadius: 12,

    elevation: 6,
  },

  createButtonText: {
    color: "#FFFFFF",

    fontSize: 17,

    fontWeight: "900",

    marginRight: 12,
  },

  /* ================= LOGIN ================= */

  loginTextContainer: {
    flexDirection: "row",

    justifyContent: "center",

    alignItems: "center",

    marginTop: 25,
  },

  loginText: {
    fontSize: 14,

    color: "#7D8493",

    marginRight: 5,
  },

  loginLink: {
    fontSize: 14,

    color: "#00A875",

    fontWeight: "800",
  },

});