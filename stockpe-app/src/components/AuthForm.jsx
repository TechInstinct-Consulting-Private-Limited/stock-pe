import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function AuthForm({ onContinue, isLoading = false, apiError = "", mobile, setMobile }) {
    const normalizedMobile = String(mobile || "").replace(/\D/g, "");
    const mobileValid = /^[6-9]\d{9}$/.test(normalizedMobile);
    const continueWithMobile = () => {
        if (mobileValid && !isLoading) onContinue?.();
    };

    return <View>
        {apiError ? <Text style={styles.apiError}>{apiError}</Text> : null}
        <Text style={styles.label}>MOBILE NUMBER</Text>
        <View style={styles.inputContainer}>
            <Text style={styles.countryCode}>+91</Text><View style={styles.line} />
            <TextInput style={styles.input} placeholder="98765 43210" placeholderTextColor="#94A3B8" keyboardType="phone-pad" autoComplete="tel" textContentType="telephoneNumber" maxLength={10} value={mobile} onChangeText={(value) => setMobile(value.replace(/\D/g, ""))} onSubmitEditing={continueWithMobile} returnKeyType="done" />
            <Ionicons name="call-outline" size={22} color="#657189" />
        </View>
        {!mobileValid && normalizedMobile.length > 0 ? <Text style={styles.error}>Enter a valid 10-digit Indian mobile number.</Text> : null}
        <TouchableOpacity onPress={continueWithMobile} disabled={!mobileValid || isLoading} style={[styles.button, (!mobileValid || isLoading) && styles.disabled]}>
            {isLoading ? <ActivityIndicator color="#FFFFFF" /> : <><Text style={styles.buttonText}>CONTINUE</Text><Ionicons name="arrow-forward" size={24} color="#FFFFFF" /></>}
        </TouchableOpacity>
        <Text style={styles.note}>OTP is requested only for a new device, first registration, or an MPIN reset.</Text>
    </View>;
}

const styles = StyleSheet.create({
    label:{fontSize:12,fontWeight:"900",letterSpacing:1.05,color:"#64748B",marginBottom:9}, inputContainer:{height:64,borderRadius:16,backgroundColor:"#F8FAFC",borderWidth:1.5,borderColor:"#E2E8F0",flexDirection:"row",alignItems:"center",paddingHorizontal:17}, countryCode:{fontSize:17,fontWeight:"900",color:"#0F172A"}, line:{height:28,width:1,backgroundColor:"#CBD5E1",marginHorizontal:13}, input:{flex:1,fontSize:17,fontWeight:"800",color:"#0F172A",letterSpacing:.4}, error:{color:"#DC2626",fontSize:12,fontWeight:"700",marginTop:8}, apiError:{color:"#DC2626",backgroundColor:"#FEF2F2",borderColor:"#FECACA",borderWidth:1,borderRadius:12,padding:12,marginBottom:16,fontSize:13,fontWeight:"700",textAlign:"center"}, button:{height:58,borderRadius:16,backgroundColor:"#00C987",marginTop:26,flexDirection:"row",alignItems:"center",justifyContent:"center",gap:10,shadowColor:"#00A86B",shadowOpacity:.18,shadowRadius:8,shadowOffset:{width:0,height:4},elevation:3}, disabled:{opacity:.45}, buttonText:{color:"#FFFFFF",fontWeight:"900",fontSize:15,letterSpacing:1}, note:{marginTop:18,fontSize:12,lineHeight:18,color:"#64748B",textAlign:"center"},
});
