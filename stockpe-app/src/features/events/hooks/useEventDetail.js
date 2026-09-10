import { useState, useMemo } from "react";
import { fetchEventById } from "../services/eventsService";

export function useEventDetail(eventId) {
  const [activeTab, setActiveTab] = useState("chart"); // "chart" | "orderbook" | "rules"
  const [activeTimeframe, setActiveTimeframe] = useState("1H");

  const event = useMemo(() => {
    return fetchEventById(eventId);
  }, [eventId]);

  return {
    event,
    activeTab,
    setActiveTab,
    activeTimeframe,
    setActiveTimeframe,
  };
}
