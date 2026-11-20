import { Ionicons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { profileTutorials } from "../content/tutorials";
import { fetchProfileTutorials } from "../services/profileService";
import { requireSecureExternalUrl } from "../../../services/externalUrl";

function tutorialKey(item) {
  return String(item?.key || item?.id || "").trim();
}

export default function TutorialDetailScreen() {
  const router = useRouter();
  const { key } = useLocalSearchParams();
  const tutorialId = Array.isArray(key) ? key[0] : key;
  const fallback = useMemo(() => profileTutorials.find((item) => tutorialKey(item) === tutorialId), [tutorialId]);
  const [tutorial, setTutorial] = useState(fallback || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchProfileTutorials().then((response) => {
      if (!active) return;
      const remote = response.success ? response.data.find((item) => tutorialKey(item) === tutorialId) : null;
      if (remote) setTutorial({ ...fallback, ...remote });
      setLoading(false);
    });
    return () => { active = false; };
  }, [fallback, tutorialId]);

  const openVideo = async () => {
    if (!tutorial?.videoUrl) {
      Alert.alert("Video coming soon", "The written guide is ready below. An administrator can add the approved tutorial video later without requiring an app update.");
      return;
    }
    try {
      const videoUrl = requireSecureExternalUrl(tutorial.videoUrl, "Tutorial video");
      await WebBrowser.openBrowserAsync(videoUrl, { presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET });
    } catch (_error) {
      Alert.alert("Unable to open video", "Please try again in a moment.");
    }
  };

  if (loading && !tutorial) {
    return <SafeAreaView style={styles.safeArea}><View style={styles.loader}><ActivityIndicator size="large" color="#00A971" /></View></SafeAreaView>;
  }

  if (!tutorial) {
    return <SafeAreaView style={styles.safeArea}><View style={styles.screen}><View style={styles.header}><TouchableOpacity accessibilityLabel="Go back" onPress={() => router.back()} style={styles.backButton}><Ionicons name="arrow-back" size={22} color="#0F172A" /></TouchableOpacity><Text style={styles.headerTitle}>Tutorial</Text><View style={styles.backButton} /></View><View style={styles.empty}><Ionicons name="help-circle-outline" size={38} color="#64748B" /><Text style={styles.emptyTitle}>Tutorial unavailable</Text><Text style={styles.emptyText}>Please return to Help & Tutorials and choose another guide.</Text></View></View></SafeAreaView>;
  }

  const steps = Array.isArray(tutorial.steps) ? tutorial.steps : fallback?.steps || ["This guide will be available shortly."];
  const hasVideo = Boolean(tutorial.videoUrl);

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <TouchableOpacity accessibilityLabel="Go back" onPress={() => router.back()} style={styles.backButton}><Ionicons name="arrow-back" size={22} color="#0F172A" /></TouchableOpacity>
          <Text style={styles.headerTitle}>Tutorial</Text>
          <View style={styles.backButton} />
        </View>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={[styles.titleCard, { backgroundColor: tutorial.background || "#ECFDF5" }]}>
            <View style={[styles.iconBox, { backgroundColor: "#FFFFFF" }]}><Ionicons name={tutorial.icon || "play-circle-outline"} size={26} color={tutorial.accent || "#00A971"} /></View>
            <View style={styles.titleCopy}><Text style={styles.title}>{tutorial.title}</Text><Text style={styles.description}>{tutorial.description}</Text></View>
          </View>

          <TouchableOpacity style={[styles.videoCard, { borderColor: tutorial.accent || "#00A971" }]} activeOpacity={0.82} onPress={openVideo}>
            <View style={[styles.videoGradient, { backgroundColor: tutorial.background || "#ECFDF5" }]}>
              <View style={[styles.playButton, { backgroundColor: tutorial.accent || "#00A971" }]}><Ionicons name="play" size={26} color="#FFFFFF" /></View>
              <Text style={styles.videoTitle}>{hasVideo ? "Watch tutorial video" : "Tutorial video coming soon"}</Text>
              <Text style={styles.videoText}>{hasVideo ? "Opens securely inside MarketPe" : "Use the written guide below for now"}</Text>
            </View>
            <View style={styles.videoFooter}><View style={styles.duration}><Ionicons name="time-outline" size={15} color="#64748B" /><Text style={styles.durationText}>{tutorial.duration || "Short guide"}</Text></View><Text style={[styles.watchText, { color: tutorial.accent || "#00A971" }]}>{hasVideo ? "Play video" : "Coming soon"}</Text></View>
          </TouchableOpacity>

          <Text style={styles.sectionLabel}>STEP-BY-STEP GUIDE</Text>
          <View style={styles.stepsCard}>
            {steps.map((step, index) => <View key={`${tutorialId}-${index}`} style={styles.stepRow}><View style={[styles.stepNumber, { backgroundColor: tutorial.background || "#ECFDF5" }]}><Text style={[styles.stepNumberText, { color: tutorial.accent || "#00A971" }]}>{index + 1}</Text></View><Text style={styles.stepText}>{step}</Text></View>)}
          </View>
          <View style={styles.note}><Ionicons name="information-circle-outline" size={18} color="#64748B" /><Text style={styles.noteText}>Tutorial links are centrally managed. When an approved YouTube video is added, this same screen will show the Play video action automatically.</Text></View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FFFFFF" }, screen: { flex: 1, backgroundColor: "#F8FAFC" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12, backgroundColor: "#FFFFFF", borderBottomWidth: 1, borderBottomColor: "#E2E8F0" },
  backButton: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: "#F8FAFC" }, headerTitle: { color: "#0F172A", fontSize: 16, fontWeight: "900" },
  content: { padding: 16, paddingBottom: 36 }, loader: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#F8FAFC" },
  titleCard: { flexDirection: "row", gap: 12, padding: 16, borderRadius: 18, marginBottom: 16 }, iconBox: { width: 48, height: 48, borderRadius: 15, alignItems: "center", justifyContent: "center" }, titleCopy: { flex: 1 }, title: { fontSize: 17, fontWeight: "900", color: "#0F172A" }, description: { marginTop: 4, color: "#475569", fontSize: 12, lineHeight: 18 },
  videoCard: { overflow: "hidden", borderRadius: 20, borderWidth: 1, backgroundColor: "#FFFFFF", marginBottom: 22 }, videoGradient: { minHeight: 180, alignItems: "center", justifyContent: "center", padding: 20 }, playButton: { width: 64, height: 64, borderRadius: 32, alignItems: "center", justifyContent: "center", paddingLeft: 3, shadowColor: "#0F172A", shadowOpacity: 0.16, shadowRadius: 8, elevation: 3 }, videoTitle: { marginTop: 14, color: "#0F172A", fontSize: 15, fontWeight: "900" }, videoText: { marginTop: 4, color: "#64748B", fontSize: 11 }, videoFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 14, paddingVertical: 12 }, duration: { flexDirection: "row", alignItems: "center", gap: 5 }, durationText: { color: "#64748B", fontSize: 11, fontWeight: "700" }, watchText: { fontSize: 12, fontWeight: "900" },
  sectionLabel: { marginBottom: 9, color: "#64748B", fontSize: 11, fontWeight: "900", letterSpacing: 0.8 }, stepsCard: { padding: 4, borderRadius: 18, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E2E8F0" }, stepRow: { flexDirection: "row", alignItems: "flex-start", gap: 12, padding: 13, borderBottomWidth: 1, borderBottomColor: "#F1F5F9" }, stepNumber: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" }, stepNumberText: { fontSize: 12, fontWeight: "900" }, stepText: { flex: 1, color: "#334155", fontSize: 12, lineHeight: 18, paddingTop: 4 }, note: { flexDirection: "row", gap: 8, alignItems: "flex-start", padding: 13, borderRadius: 14, backgroundColor: "#F1F5F9", marginTop: 16 }, noteText: { flex: 1, color: "#64748B", fontSize: 10.5, lineHeight: 16 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", padding: 28 }, emptyTitle: { marginTop: 12, color: "#0F172A", fontSize: 17, fontWeight: "900" }, emptyText: { marginTop: 6, textAlign: "center", color: "#64748B", fontSize: 12, lineHeight: 18 },
});
