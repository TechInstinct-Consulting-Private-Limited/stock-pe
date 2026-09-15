import React from "react";
import { useLocalSearchParams } from "expo-router";
import EventDetailScreen from "../../src/features/events/screens/EventDetailScreen";

export default function EventDetailRoute() {
  const { id } = useLocalSearchParams();
  return <EventDetailScreen eventId={id} />;
}
