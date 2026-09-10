import React from "react";
import { Platform, StatusBar, StyleSheet, Text, View } from "react-native";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import MarketTicker from "../components/MarketTicker";

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView edges={["top"]} style={styles.shellContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* 
        Persistent Top Live Market Ticker:
        Placed at the root shell level below safe area notch so it never gets clipped.
      */}
      <MarketTicker />

      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: true,
          tabBarStyle: [
            styles.tabBar,
            {
              height: 60 + (insets.bottom > 0 ? insets.bottom : 8),
              paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
            },
          ],
          tabBarActiveTintColor: "#00C987",
          tabBarInactiveTintColor: "#94A3B8",
          tabBarLabelStyle: styles.tabBarLabel,
          tabBarItemStyle: styles.tabBarItem,
          lazy: false,
          sceneStyle: { backgroundColor: "#F4F6FB" },
        }}
      >
        <Tabs.Screen
          name="events"
          options={{
            title: "EVENTS",
            tabBarIcon: ({ color, focused }) => (
              <View style={styles.iconContainer}>
                <Ionicons
                  name={focused ? "home" : "home-outline"}
                  size={22}
                  color={focused ? "#00C987" : "#94A3B8"}
                />
                {focused && <View style={styles.activeLine} />}
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="contests"
          options={{
            title: "CONTESTS",
            tabBarIcon: ({ color, focused }) => (
              <View style={styles.iconContainer}>
                <Ionicons
                  name={focused ? "flash" : "flash-outline"}
                  size={22}
                  color={focused ? "#00C987" : "#94A3B8"}
                />
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>2</Text>
                </View>
                {focused && <View style={styles.activeLine} />}
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="leaders"
          options={{
            title: "LEADERS",
            tabBarIcon: ({ color, focused }) => (
              <View style={styles.iconContainer}>
                <Ionicons
                  name={focused ? "trophy" : "trophy-outline"}
                  size={22}
                  color={focused ? "#00C987" : "#94A3B8"}
                />
                {focused && <View style={styles.activeLine} />}
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="wallet"
          options={{
            title: "WALLET",
            tabBarIcon: ({ color, focused }) => (
              <View style={styles.iconContainer}>
                <Ionicons
                  name={focused ? "wallet" : "wallet-outline"}
                  size={22}
                  color={focused ? "#00C987" : "#94A3B8"}
                />
                {focused && <View style={styles.activeLine} />}
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "PROFILE",
            tabBarIcon: ({ color, focused }) => (
              <View style={styles.iconContainer}>
                <Ionicons
                  name={focused ? "person" : "person-outline"}
                  size={22}
                  color={focused ? "#00C987" : "#94A3B8"}
                />
                {focused && <View style={styles.activeLine} />}
              </View>
            ),
          }}
        />
      </Tabs>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  shellContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  tabBar: {
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#EDF2F7",
    paddingTop: 8,
    elevation: 10,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  tabBarItem: {
    paddingVertical: 0,
  },
  tabBarLabel: {
    fontSize: 9.5,
    fontWeight: "900",
    letterSpacing: 0.6,
    marginTop: 3,
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    width: 32,
    height: 26,
  },
  activeLine: {
    position: "absolute",
    bottom: -8,
    width: 20,
    height: 2.5,
    backgroundColor: "#00C987",
    borderRadius: 2,
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -6,
    backgroundColor: "#00C987",
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 8.5,
    fontWeight: "900",
  },
});
