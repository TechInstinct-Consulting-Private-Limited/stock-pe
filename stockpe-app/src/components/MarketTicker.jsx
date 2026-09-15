import React, { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function MarketTicker() {
  const scrollAnim = useRef(new Animated.Value(0)).current;

  const baseIndices = [
    {
      symbol: "NIFTY 50",
      value: "24,187.65",
      change: "+0.84%",
      isPositive: true,
    },
    {
      symbol: "SENSEX",
      value: "79,432.18",
      change: "-0.31%",
      isPositive: false,
    },
    {
      symbol: "BANK NIFTY",
      value: "51,843.25",
      change: "+1.12%",
      isPositive: true,
    },
    {
      symbol: "MIDCAP",
      value: "13,240.50",
      change: "+0.45%",
      isPositive: true,
    },
    {
      symbol: "NIFTY IT",
      value: "38,750.00",
      change: "+1.65%",
      isPositive: true,
    },
  ];

  // Repeat 8 times to form an endless ribbon
  const tickerItems = [
    ...baseIndices,
    ...baseIndices,
    ...baseIndices,
    ...baseIndices,
    ...baseIndices,
    ...baseIndices,
    ...baseIndices,
    ...baseIndices,
  ];

  useEffect(() => {
    // Universal 100% reliable loop on Web, iOS, and Android
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(scrollAnim, {
          toValue: -1200,
          duration: 18000,
          easing: Easing.linear,
          useNativeDriver: false, // Ensures compatibility across React Native Web & Native
        }),
        Animated.timing(scrollAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: false,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [scrollAnim]);

  return (
    <View style={styles.tickerWrapper}>
      <Animated.View
        style={[
          styles.animatedRow,
          {
            transform: [{ translateX: scrollAnim }],
          },
        ]}
      >
        {tickerItems.map((item, index) => (
          <View key={`${item.symbol}-${index}`} style={styles.tickerItem}>
            <Text style={styles.symbolText}>{item.symbol}</Text>
            <Text style={styles.valueText}>{item.value}</Text>
            <View
              style={[
                styles.changeTag,
                item.isPositive ? styles.greenTag : styles.redTag,
              ]}
            >
              <Text
                style={[
                  styles.changeText,
                  item.isPositive ? styles.greenText : styles.redText,
                ]}
              >
                {item.isPositive ? "↗" : "↘"} {item.change}
              </Text>
            </View>
            <View style={styles.divider} />
          </View>
        ))}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  tickerWrapper: {
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    paddingVertical: 7,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 1,
    width: "100%",
  },
  animatedRow: {
    flexDirection: "row",
    alignItems: "center",
    width: 6000, // Wide track ensuring continuous strip
  },
  tickerItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 4,
    flexShrink: 0,
  },
  symbolText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#64748B",
    letterSpacing: 0.4,
    marginRight: 6,
  },
  valueText: {
    fontSize: 11.5,
    fontWeight: "800",
    color: "#0F172A",
    marginRight: 6,
    letterSpacing: -0.2,
  },
  changeTag: {
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  greenTag: {
    backgroundColor: "#E6FBF3",
  },
  redTag: {
    backgroundColor: "#FEE2E2",
  },
  changeText: {
    fontSize: 10,
    fontWeight: "800",
  },
  greenText: {
    color: "#00C987",
  },
  redText: {
    color: "#EF4444",
  },
  divider: {
    width: 1,
    height: 14,
    backgroundColor: "#E2E8F0",
    marginHorizontal: 12,
  },
});
