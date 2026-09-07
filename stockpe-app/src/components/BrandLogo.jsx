import { StyleSheet, Text, View } from "react-native";

export default function BrandLogo({ size = "medium" }) {
  return (
    <View
      style={[
        styles.logoContainer,

        size === "large" && styles.largeLogo,
        size === "small" && styles.smallLogo,
      ]}
    >
      <Text
        style={[
          styles.logoIcon,

          size === "large" && styles.largeIcon,
          size === "small" && styles.smallIcon,
        ]}
      >
        ↗
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "rgba(255,255,255,0.9)",

    shadowColor: "#00C987",

    shadowOffset: {
      width: 0,
      height: 0,
    },

    shadowOpacity: 0.35,

    shadowRadius: 30,

    elevation: 12,
  },

  largeLogo: {
    width: 190,
    height: 190,

    borderRadius: 40,

    marginBottom: 10,
  },

  smallLogo: {
    width: 92,
    height: 92,

    borderRadius: 27,

    backgroundColor: "transparent",

    borderWidth: 1.5,

    borderColor: "#00C987",
  },

  logoIcon: {
    color: "#00B978",

    fontWeight: "bold",
  },

  largeIcon: {
    fontSize: 90,
  },

  smallIcon: {
    fontSize: 48,
  },
});