import { useEffect, useState } from "react";
import { fetchDashboardContest } from "../services/dashboardService";

export function useEventDetail(eventId) {
  const [activeTab, setActiveTab] = useState("chart"); // "chart" | "orderbook" | "rules"
  const [activeTimeframe, setActiveTimeframe] = useState("1H");
  const [event, setEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError("");

    fetchDashboardContest(eventId)
      .then((nextEvent) => {
        if (isMounted) setEvent(nextEvent);
      })
      .catch(() => {
        if (isMounted) setError("Contest details are unavailable. Please go back and try again.");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [eventId]);

  return {
    event,
    isLoading,
    error,
    activeTab,
    setActiveTab,
    activeTimeframe,
    setActiveTimeframe,
  };
}
