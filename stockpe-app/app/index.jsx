import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect, useState } from "react";

import {
  StyleSheet,
  Text,
  View,
} from "react-native";

import BrandLogo from "./components/BrandLogo";

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
    }, 40);

    return () => clearInterval(interval);
  }, []);

  // Go to Login after splash
  useEffect(() => {
    if (progress >= 100) {
      router.replace("/login");
    }
  }, [progress]);

  return (
    <LinearGradient
      colors={["#E8F9FA", "#F1F1FF", "#FFFFFF"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.container}
    >
      {/* Logo */}
      <BrandLogo size="large" />

      {/* Small Heading */}
      <Text style={styles.smallHeading}>
        INDIA'S #1 MARKET GAME
      </Text>

      {/* App Name */}
      <Text style={styles.stockpe}>
        STOCKPE
      </Text>

      {/* Tagline */}
      <Text style={styles.tagline}>
        P R E D I C T   •   C O M P E T E   •   W I N
      </Text>

      {/* Statistics */}
      <View style={styles.statsContainer}>

        {/* Pool */}
        <View style={styles.stat}>
          <Text style={[styles.statValue, styles.green]}>
            ₹49.5L
          </Text>

          <Text style={styles.statLabel}>
            Today's Pool
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
            colors={["#00C987", "#6366F1"]}
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
        V 2 . 4 . 1   •   SEBI REGULATED
      </Text>

    </LinearGradient>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,

    alignItems: "center",
    justifyContent: "center",

    paddingHorizontal: 30,
  },

  /* Small Heading */

  smallHeading: {
    fontSize: 14,

    letterSpacing: 5,

    color: "#7D8190",

    marginTop: 55,
    marginBottom: 18,

    textAlign: "center",
  },

  /* STOCKPE */

  stockpe: {
    fontSize: 58,

    fontWeight: "900",

    letterSpacing: 8,

    color: "#071329",

    marginBottom: 18,

    textAlign: "center",
  },

  /* Tagline */

  tagline: {
    fontSize: 12,

    letterSpacing: 3,

    color: "#7D8190",

    textAlign: "center",

    width: "100%",
  },

  /* Statistics */

  statsContainer: {
    flexDirection: "row",

    width: "100%",

    justifyContent: "space-around",

    marginTop: 55,
  },

  stat: {
    alignItems: "center",

    minWidth: 85,
  },

  statValue: {
    fontSize: 28,

    fontWeight: "800",
  },

  statLabel: {
    fontSize: 13,

    color: "#858895",

    marginTop: 6,

    textAlign: "center",
  },

  green: {
    color: "#00B978",
  },

  blue: {
    color: "#5865D9",
  },

  yellow: {
    color: "#F0B323",
  },

  /* Progress */

  progressWrapper: {
    position: "absolute",

    bottom: 75,

    width: "70%",
  },

  progressBackground: {
    height: 4,

    width: "100%",

    backgroundColor: "#E4E5EF",

    borderRadius: 10,

    overflow: "hidden",
  },

  progress: {
    height: "100%",

    borderRadius: 10,
  },

  /* Version */

  version: {
    position: "absolute",

    bottom: 38,

    fontSize: 11,

    letterSpacing: 4,

    color: "#A5A7B0",

    textAlign: "center",
  },

});