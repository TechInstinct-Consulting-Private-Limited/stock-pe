import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function NotificationItemCard({ notification, onPress }) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onPress(notification.id)}
      style={[
        styles.card,
        !notification.read && styles.cardUnread,
      ]}
    >
      <View
        style={[
          styles.iconCircle,
          { backgroundColor: notification.iconBg || "#F1F5F9" },
        ]}
      >
        <Ionicons
          name={notification.icon}
          size={20}
          color={notification.iconColor}
        />
      </View>

      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={styles.title} numberOfLines={1}>
            {notification.title}
          </Text>
          {!notification.read && <View style={styles.unreadDot} />}
        </View>
        <Text style={styles.message}>{notification.message}</Text>
        <Text style={styles.time}>{notification.time}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#EDF2F7",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  cardUnread: {
    borderColor: "#A7F3D0",
    backgroundColor: "#FAFFFD",
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 13.5,
    fontWeight: "800",
    color: "#0F172A",
    flex: 1,
    marginRight: 6,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#00C987",
  },
  message: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
    marginTop: 3,
    lineHeight: 16,
  },
  time: {
    fontSize: 10.5,
    color: "#94A3B8",
    fontWeight: "600",
    marginTop: 6,
  },
});
