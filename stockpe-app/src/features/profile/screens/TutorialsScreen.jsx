import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { profileTutorials } from "../content/tutorials";
import { fetchProfileTutorials } from "../services/profileService";

export default function TutorialsScreen() {
  const router = useRouter();
  const [tutorials, setTutorials] = useState(profileTutorials);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchProfileTutorials().then((response) => {
      if (active && response.success && response.data.length) setTutorials(response.data);
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, []);

  const openTutorial = async (tutorial) => {
    if (!tutorial.videoUrl) {
      Alert.alert(
        "Video coming soon",
        "This MarketPe tutorial will be available here soon. Tutorial links can be updated by the admin without changing this screen.",
      );
      return;
    }

    try {
      await Linking.openURL(tutorial.videoUrl);
    } catch (_error) {
      Alert.alert("Unable to open video", "Please try again in a moment.");
    }
  };

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <TouchableOpacity accessibilityLabel="Go back" onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={22} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Help & Tutorials</Text>
          <View style={styles.backButton} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.hero}>
            <View style={styles.heroIcon}><Ionicons name="play-circle" size={25} color="#00A971" /></View>
            <View style={styles.heroCopy}>
              <Text style={styles.heroTitle}>Learn MarketPe step by step</Text>
              <Text style={styles.heroText}>Short guides for predictions, Demo USDT, rankings, KYC and your wallet.</Text>
            </View>
          </View>

          <Text style={styles.sectionLabel}>GET STARTED</Text>
          {loading ? <ActivityIndicator color="#00A971" style={styles.loader} /> : null}
          {tutorials.map((tutorial) => (
            <TouchableOpacity key={tutorial.id} style={styles.card} activeOpacity={0.78} onPress={() => openTutorial(tutorial)}>
              <View style={[styles.iconBox, { backgroundColor: tutorial.background }]}>
                <Ionicons name={tutorial.icon} size={22} color={tutorial.accent} />
              </View>
              <View style={styles.cardCopy}>
                <Text style={styles.cardTitle}>{tutorial.title}</Text>
                <Text style={styles.cardDescription}>{tutorial.description}</Text>
                <View style={styles.videoRow}>
                  <Ionicons name={tutorial.videoUrl ? "logo-youtube" : "time-outline"} size={13} color={tutorial.accent} />
                  <Text style={[styles.videoText, { color: tutorial.accent }]}>{tutorial.videoUrl ? "Watch tutorial" : "Video coming soon"}</Text>
                </View>
              </View>
              <View style={[styles.arrowBox, { backgroundColor: tutorial.background }]}>
                <Ionicons name="chevron-forward" size={17} color={tutorial.accent} />
              </View>
            </TouchableOpacity>
          ))}

          <View style={styles.note}>
            <Ionicons name="information-circle-outline" size={17} color="#64748B" />
            <Text style={styles.noteText}>Tutorial content will be managed centrally in a future admin update, so video links can change without requiring an app update.</Text>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FFFFFF" },
  screen: { flex: 1, backgroundColor: "#F8FAFC" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12, backgroundColor: "#FFFFFF", borderBottomWidth: 1, borderBottomColor: "#E2E8F0" },
  backButton: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: "#F8FAFC" },
  headerTitle: { color: "#0F172A", fontSize: 16, fontWeight: "900" },
  content: { padding: 16, paddingBottom: 32 },
  hero: { flexDirection: "row", gap: 12, padding: 16, borderRadius: 18, backgroundColor: "#ECFDF5", borderWidth: 1, borderColor: "#A7F3D0", marginBottom: 20 },
  heroIcon: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: "#D1FAE5" },
  heroCopy: { flex: 1 },
  heroTitle: { fontSize: 14, fontWeight: "900", color: "#064E3B" },
  heroText: { marginTop: 3, fontSize: 11.5, lineHeight: 16, color: "#047857" },
  sectionLabel: { marginBottom: 9, fontSize: 11, fontWeight: "900", letterSpacing: 0.8, color: "#64748B" },
  loader: { marginVertical: 20 },
  card: { flexDirection: "row", alignItems: "center", padding: 14, gap: 11, borderRadius: 18, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E2E8F0", marginBottom: 10 },
  iconBox: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  cardCopy: { flex: 1, minWidth: 0 },
  cardTitle: { fontSize: 13.5, fontWeight: "900", color: "#0F172A" },
  cardDescription: { marginTop: 3, fontSize: 10.5, lineHeight: 15, color: "#64748B" },
  videoRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 7 },
  videoText: { fontSize: 10.5, fontWeight: "800" },
  arrowBox: { width: 30, height: 30, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  note: { flexDirection: "row", alignItems: "flex-start", gap: 8, marginTop: 8, padding: 13, borderRadius: 14, backgroundColor: "#F1F5F9" },
  noteText: { flex: 1, fontSize: 10.5, lineHeight: 16, color: "#64748B" },
});
