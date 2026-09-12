import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BrandLogo from "./components/BrandLogo";
import { getAuthToken } from "../src/services/authStorage";

export default function Index() {
  const [progress, setProgress] = useState(0);

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
      colors={["#060D1E", "#0A1733", "#040914"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.gradient}
    >
      <SafeAreaView edges={["top", "bottom", "left", "right"]} style={styles.container}>
        {/* Logo */}
        <BrandLogo size="large" />

      {/* Small Heading */}
      <View style={styles.badgePill}>
        <Text style={styles.badgePillText}>CRYPTO INDEX PREDICTIONS</Text>
      </View>

      {/* App Name */}
      <Text style={styles.stockpe}>
        STOCKPE
      </Text>

      {/* Tagline */}
      <Text style={styles.tagline}>
        PREDICT  •  COMPETE  •  WIN USDT
      </Text>

      {/* Statistics */}
      <View style={styles.statsContainer}>

        {/* Pool */}
        <View style={styles.stat}>
          <Text style={[styles.statValue, styles.green]}>
            $50K
          </Text>

          <Text style={styles.statLabel}>
            Daily Pool (₮)
          </Text>
        </View>

        {/* Traders */}
        <View style={styles.stat}>
          <Text style={[styles.statValue, styles.blue]}>
            2.1M+
          </Text>

          <Text style={styles.statLabel}>
            Traders
          </Text>
        </View>

        {/* Rating */}
        <View style={styles.stat}>
          <Text style={[styles.statValue, styles.yellow]}>
            4.8★
          </Text>

          <Text style={styles.statLabel}>
            Rating
          </Text>
        </View>

      </View>

      {/* Progress Bar */}
      <View style={styles.progressWrapper}>
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
      </View>

      {/* Version */}
      <Text style={styles.version}>
        V 2.4.1  •  100% USDT CRYPTO SETTLEMENTS
      </Text>
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
    paddingHorizontal: 30,
  },

  badgePill: {
    backgroundColor: "rgba(0, 201, 135, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(0, 201, 135, 0.3)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop: 40,
    marginBottom: 14,
  },

  badgePillText: {
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 2,
    color: "#00C987",
    textAlign: "center",
  },

  stockpe: {
    fontSize: 54,
    fontWeight: "900",
    letterSpacing: 7,
    color: "#FFFFFF",
    marginBottom: 10,
    textAlign: "center",
  },

  tagline: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 3,
    color: "#94A3B8",
    textAlign: "center",
    width: "100%",
  },

  statsContainer: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-around",
    marginTop: 45,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    paddingVertical: 18,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.07)",
  },

  stat: {
    alignItems: "center",
    minWidth: 85,
  },

  statValue: {
    fontSize: 26,
    fontWeight: "900",
  },

  statLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#94A3B8",
    marginTop: 4,
    textAlign: "center",
  },

  green: {
    color: "#00C987",
  },

  blue: {
    color: "#38BDF8",
  },

  yellow: {
    color: "#F59E0B",
  },

  progressWrapper: {
    position: "absolute",
    bottom: 75,
    width: "70%",
  },

  progressBackground: {
    height: 5,
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 10,
    overflow: "hidden",
  },

  progress: {
    height: "100%",
    borderRadius: 10,
  },

  version: {
    position: "absolute",
    bottom: 38,
    fontSize: 10.5,
    fontWeight: "700",
    letterSpacing: 2,
    color: "#64748B",
    textAlign: "center",
  },
});