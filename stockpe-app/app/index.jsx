import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BrandLogo from "../src/components/BrandLogo";
import { getAuthToken } from "../src/services/authStorage";
import { registerCurrentDeviceForPush } from "../src/services/pushNotifications";

export default function Index() {
  const [progress, setProgress] = useState(0);
  const { height, width } = useWindowDimensions();
  const isCompact = height < 680;
  const isWide = width >= 700;
  const logoSize = isCompact ? 112 : isWide ? 164 : 138;

  // Splash loading
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((previous) => {
        if (previous >= 100) {
          clearInterval(interval);
          return 100;
        }

        return previous + 2;
      });
    }, 35);

    return () => clearInterval(interval);
  }, []);

  // Check auth and route appropriately
  useEffect(() => {
    if (progress >= 100) {
      getAuthToken()
        .then((token) => {
          if (token) {
            registerCurrentDeviceForPush().catch(() => {});
            router.replace("/(tabs)/events");
          } else {
            router.replace("/login");
          }
        })
        .catch(() => {
          router.replace("/login");
        });
    }
  }, [progress]);


  return (
    <LinearGradient
      colors={["#FFFFFF", "#F8FAFC", "#F0FDF4"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.gradient}
    >
      <SafeAreaView edges={["top", "bottom", "left", "right"]} style={styles.container}>
        <View style={[styles.content, isCompact && styles.contentCompact]}>
          {/* Central brand slot: replace BrandLogo with the approved MarketPe asset when supplied. */}
          <View style={[styles.logoSlot, { width: logoSize + 22, height: logoSize + 22, borderRadius: Math.round((logoSize + 22) * 0.29) }]}>
            <BrandLogo size="large" dimension={logoSize} />
          </View>

          <View style={styles.badgePill}>
            <Text style={styles.badgePillText}>MARKET INTELLIGENCE</Text>
          </View>

          <Text style={[styles.marketPe, isCompact && styles.marketPeCompact]}>MarketPe</Text>
          <Text style={styles.tagline}>PREDICT MARKET MOVEMENTS WITH CONFIDENCE</Text>
        </View>

        <View style={[styles.loadingArea, isCompact && styles.loadingAreaCompact]}>
          <Text style={styles.loadingLabel}>Preparing your experience</Text>
          <View style={styles.progressBackground}>
            <LinearGradient
              colors={["#00C987", "#38BDF8"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[
                styles.progress,
                {
                  width: `${progress}%`,
                },
              ]}
            />
          </View>
          <Text style={styles.loadingHint}>Securing your session</Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  content: {
    alignItems: "center",
    width: "100%",
    maxWidth: 430,
    marginBottom: 72,
  },
  contentCompact: {
    marginBottom: 44,
  },
  logoSlot: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.74)",
    borderWidth: 1,
    borderColor: "rgba(0,201,135,0.24)",
    shadowColor: "#00A86B",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 5,
  },

  badgePill: {
    backgroundColor: "#E6FBF3",
    borderWidth: 1,
    borderColor: "#A7F3D0",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop: 26,
    marginBottom: 10,
  },

  badgePillText: {
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 2,
    color: "#059669",
    textAlign: "center",
  },

  marketPe: {
    fontSize: 46,
    fontWeight: "900",
    letterSpacing: -1.4,
    color: "#0F172A",
    marginBottom: 9,
    textAlign: "center",
  },
  marketPeCompact: {
    fontSize: 40,
  },

  tagline: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.4,
    color: "#64748B",
    textAlign: "center",
    width: "100%",
  },

  loadingArea: {
    position: "absolute",
    bottom: 42,
    width: "74%",
    maxWidth: 330,
  },
  loadingAreaCompact: {
    bottom: 24,
  },
  loadingLabel: {
    marginBottom: 10,
    color: "#475569",
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
  },

  progressBackground: {
    height: 6,
    width: "100%",
    backgroundColor: "#E2E8F0",
    borderRadius: 10,
    overflow: "hidden",
  },

  progress: {
    height: "100%",
    borderRadius: 10,
  },

  loadingHint: {
    marginTop: 10,
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 0.3,
    color: "#94A3B8",
    textAlign: "center",
  },
});
