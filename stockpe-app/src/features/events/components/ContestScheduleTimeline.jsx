import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const IST_TIME_ZONE = "Asia/Kolkata";

function formatScheduleTime(value) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "Scheduled time";
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: IST_TIME_ZONE,
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export default function ContestScheduleTimeline({ event }) {
  const milestones = [
    { label: "Entries open", value: formatScheduleTime(event?.opensAt), icon: "lock-open-outline", color: "#D97706", bg: "#FEF3C7" },
    { label: "Prediction locks", value: formatScheduleTime(event?.liveAt || event?.closesAt), icon: "lock-closed-outline", color: "#2563EB", bg: "#DBEAFE" },
    { label: "Target & result", value: formatScheduleTime(event?.closesAt), icon: "flag-outline", color: "#059669", bg: "#D1FAE5" },
  ];

  return <View style={styles.container}>
    <View style={styles.headingRow}>
      <Ionicons name="calendar-outline" size={14} color="#007B52" />
      <Text style={styles.heading}>CONTEST SCHEDULE · IST</Text>
    </View>
    <View style={styles.timeline}>
      {milestones.map((milestone, index) => <React.Fragment key={milestone.label}>
        <View style={styles.step}>
          <View style={[styles.iconCircle, { backgroundColor: milestone.bg }]}>
            <Ionicons name={milestone.icon} size={15} color={milestone.color} />
          </View>
          <Text style={styles.stepLabel}>{milestone.label}</Text>
          <Text style={styles.stepValue}>{milestone.value}</Text>
        </View>
        {index < milestones.length - 1 && <View style={styles.connector} />}
      </React.Fragment>)}
    </View>
  </View>;
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E2E8F0",
    borderRadius: 16,
    borderWidth: 1,
    marginHorizontal: 16,
    marginTop: 12,
    padding: 14,
  },
  headingRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 5,
    marginBottom: 12,
  },
  heading: {
    color: "#007B52",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.7,
  },
  timeline: {
    alignItems: "flex-start",
    flexDirection: "row",
  },
  step: {
    alignItems: "center",
    flex: 1,
  },
  iconCircle: {
    alignItems: "center",
    borderRadius: 14,
    height: 28,
    justifyContent: "center",
    width: 28,
  },
  stepLabel: {
    color: "#475569",
    fontSize: 9,
    fontWeight: "800",
    marginTop: 6,
    textAlign: "center",
  },
  stepValue: {
    color: "#071329",
    fontSize: 8.5,
    fontWeight: "700",
    lineHeight: 12,
    marginTop: 2,
    textAlign: "center",
  },
  connector: {
    backgroundColor: "#D1FAE5",
    height: 2,
    marginTop: 13,
    width: 12,
  },
});
