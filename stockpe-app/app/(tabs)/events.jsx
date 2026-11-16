import React from "react";
import { useLocalSearchParams } from "expo-router";
import EventsFeedScreen from "../../src/features/events/screens/EventsFeedScreen";

export default function EventsTabRoute() {
  const { tab } = useLocalSearchParams();
  return <EventsFeedScreen key={String(tab || "ALL")} initialFilter={tab} />;
}
