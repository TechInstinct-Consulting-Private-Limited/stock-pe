import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function UsdtBadge({ amount, style, textStyle }) {
  return (
    <View style={[styles.badgeContainer, style]}>
      <View style={styles.iconCircle}>
        <Text style={styles.iconText}>₮</Text>
      </View>
      <Text style={[styles.amountText, textStyle]}>
        {amount} {amount?.toString().includes("USDT") ? "" : "USDT"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badgeContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E6FBF3",
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: "rgba(0, 201, 135, 0.2)",
    alignSelf: "flex-start",
  },
  iconCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#00C987",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 4,
  },
  iconText: {
    fontSize: 8.5,
    fontWeight: "900",
    color: "#FFFFFF",
    lineHeight: 11,
  },
  amountText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#059669",
    letterSpacing: 0.2,
  },
});
