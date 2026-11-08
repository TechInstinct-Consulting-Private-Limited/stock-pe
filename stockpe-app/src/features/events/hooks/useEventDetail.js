import { useCallback, useEffect, useState } from "react";
import { useFocusEffect } from "expo-router";
import { fetchDashboardContest } from "../services/dashboardService";
import { subscribeToLiveMarket } from "../../../services/liveMarketStream";

function quoteMatchesEvent(quote, event) {
  const code = String(event?.instrument?.code || "").replace(/\W/g, "").toUpperCase();
  const name = String(quote?.name || quote?.symbol || "").replace(/\W/g, "").toUpperCase();
  return Boolean(code && name && (code.includes(name) || name.includes(code)));
}

export function useEventDetail(eventId) {
  const [activeTab, setActiveTab] = useState("chart"); // "chart" | "orderbook" | "rules"
  const [activeTimeframe, setActiveTimeframe] = useState("1H");
  const [event, setEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const refreshEvent = useCallback(async () => {
    try {
      const nextEvent = await fetchDashboardContest(eventId);
      setEvent(nextEvent);
      setError("");
    } catch (_error) {
      // Preserve loaded contest details if a manual refresh cannot complete.
    }
  }, [eventId]);

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

  useFocusEffect(
    useCallback(() => {
      refreshEvent();
      const timer = setInterval(() => {
        refreshEvent();
      }, 15_000);
      return () => clearInterval(timer);
    }, [refreshEvent])
  );

  useEffect(() => subscribeToLiveMarket((quotes) => {
    setEvent((current) => {
      if (!current) return current;
      const quote = quotes.find((item) => quoteMatchesEvent(item, current));
      if (!quote) return current;
      return {
        ...current,
        currentPrice: quote.value,
        spotNumeric: Number(quote.rawValue),
        change: quote.change,
        isPositive: quote.isPositive,
        marketProvider: quote.provider,
        marketUpdatedAt: new Date().toISOString(),
      };
    });
  }), []);

  return {
    event,
    isLoading,
    error,
    refreshEvent,
    activeTab,
    setActiveTab,
    activeTimeframe,
    setActiveTimeframe,
  };
}
