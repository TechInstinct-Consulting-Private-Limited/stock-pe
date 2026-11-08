import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { registerCurrentDeviceForPush } from "../../../services/pushNotifications";
import { fetchNotificationPreferences, saveNotificationPreferences } from "../services/profileService";

const defaultPreferences = { contest_push_enabled: true, wallet_push_enabled: true, system_push_enabled: true, marketing_push_enabled: false };

const rows = [
  ["contestPushEnabled", "contest_push_enabled", "Contest updates", "Scheduled, open, live and result alerts"],
  ["walletPushEnabled", "wallet_push_enabled", "Wallet alerts", "Balance, reward and payout-status updates"],
  ["systemPushEnabled", "system_push_enabled", "Account & security", "Important service and account notices"],
  ["marketingPushEnabled", "marketing_push_enabled", "Product updates", "Optional offers and announcements"],
];

export default function NotificationPreferencesScreen() {
  const router = useRouter();
  const [preferences, setPreferences] = useState(defaultPreferences);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deviceStatus, setDeviceStatus] = useState("");

  useEffect(() => {
    fetchNotificationPreferences().then((response) => {
      if (response.success) setPreferences((current) => ({ ...current, ...response.data }));
      setLoading(false);
    });
  }, []);

  const update = async (apiKey, databaseKey, value) => {
    const next = { ...preferences, [databaseKey]: value };
    setPreferences(next);
    setSaving(true);
    const response = await saveNotificationPreferences({ [apiKey]: value });
    setSaving(false);
    if (!response.success) setPreferences(preferences);
  };

  const enableDeviceAlerts = async () => {
    setDeviceStatus("Requesting permission…");
    try {
      const result = await registerCurrentDeviceForPush({ requestPermission: true });
      setDeviceStatus(result.registered ? "This device is ready for alerts." : "Permission was not granted. You can enable it later in phone settings.");
    } catch (_error) {
      setDeviceStatus("This device could not register yet. Please try again after installing a fresh app build.");
    }
  };

  return <SafeAreaView style={styles.safe}><View style={styles.screen}><View style={styles.header}><TouchableOpacity onPress={() => router.back()} style={styles.back}><Ionicons name="arrow-back" size={22} color="#0F172A" /></TouchableOpacity><Text style={styles.title}>Notification settings</Text><View style={styles.back} /></View><View style={styles.content}><View style={styles.deviceCard}><View style={styles.icon}><Ionicons name="phone-portrait-outline" size={22} color="#00A971" /></View><View style={styles.deviceCopy}><Text style={styles.deviceTitle}>Device alerts</Text><Text style={styles.deviceText}>Allow lock-screen alerts for contests and account activity.</Text></View></View><TouchableOpacity style={styles.enableButton} onPress={enableDeviceAlerts} activeOpacity={0.8}><Text style={styles.enableText}>Enable device alerts</Text><Ionicons name="notifications-outline" size={18} color="#FFFFFF" /></TouchableOpacity>{deviceStatus ? <Text style={styles.status}>{deviceStatus}</Text> : null}<Text style={styles.section}>Alert categories</Text>{loading ? <ActivityIndicator color="#00C987" style={styles.loader} /> : rows.map(([apiKey, databaseKey, title, description]) => <View style={styles.row} key={apiKey}><View style={styles.rowCopy}><Text style={styles.rowTitle}>{title}</Text><Text style={styles.rowText}>{description}</Text></View><Switch value={Boolean(preferences[databaseKey])} disabled={saving} onValueChange={(value) => update(apiKey, databaseKey, value)} trackColor={{ false: "#CBD5E1", true: "#A7F3D0" }} thumbColor={preferences[databaseKey] ? "#00A971" : "#F8FAFC"} /></View>)}<Text style={styles.footer}>In-app notifications remain available in your inbox even when device alerts are turned off.</Text></View></View></SafeAreaView>;
}

const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: "#FFF" }, screen: { flex: 1, backgroundColor: "#F8FAFC" }, header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 14, backgroundColor: "#FFF", borderBottomWidth: 1, borderBottomColor: "#E2E8F0" }, back: { width: 34, padding: 6 }, title: { fontSize: 16, fontWeight: "900", color: "#0F172A" }, content: { padding: 18 }, deviceCard: { flexDirection: "row", gap: 12, backgroundColor: "#ECFDF5", borderWidth: 1, borderColor: "#A7F3D0", padding: 14, borderRadius: 16 }, icon: { width: 42, height: 42, alignItems: "center", justifyContent: "center", backgroundColor: "#D1FAE5", borderRadius: 13 }, deviceCopy: { flex: 1 }, deviceTitle: { fontSize: 14, fontWeight: "900", color: "#064E3B" }, deviceText: { fontSize: 11, lineHeight: 16, marginTop: 3, color: "#047857" }, enableButton: { marginTop: 12, borderRadius: 12, padding: 13, backgroundColor: "#00A971", flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8 }, enableText: { color: "#FFF", fontWeight: "900", fontSize: 13 }, status: { marginTop: 8, fontSize: 11, lineHeight: 16, color: "#64748B" }, section: { marginTop: 24, marginBottom: 8, fontSize: 12, fontWeight: "900", color: "#64748B", textTransform: "uppercase", letterSpacing: .7 }, row: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFF", borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 14, padding: 14, marginTop: 9 }, rowCopy: { flex: 1, paddingRight: 12 }, rowTitle: { fontSize: 13, fontWeight: "800", color: "#0F172A" }, rowText: { marginTop: 3, fontSize: 10.5, color: "#64748B", lineHeight: 15 }, loader: { marginTop: 25 }, footer: { marginTop: 20, fontSize: 10.5, lineHeight: 16, color: "#64748B", textAlign: "center" } });
