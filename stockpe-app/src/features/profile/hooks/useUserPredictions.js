import { useState, useEffect, useMemo } from "react";
import {
  USER_PREDICTIONS_DATA,
  fetchUserPredictions,
} from "../services/profileService";

export function useUserPredictions() {
  const [activeTab, setActiveTab] = useState("ALL"); // "ALL" | "LIVE" | "SETTLED"
  const [predictions, setPredictions] = useState(USER_PREDICTIONS_DATA);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    fetchUserPredictions({ filter: activeTab }).then((res) => {
      setIsLoading(false);
      if (res.success) {
        setPredictions(res.data);
      }
    });
  }, [activeTab]);

  const stats = useMemo(() => {
    const totalInvested = predictions.reduce((acc, p) => acc + (p.investedInr || 0), 0);
    const liveProfits = predictions
      .filter((p) => p.status === "LIVE")
      .reduce((acc, p) => acc + (p.pnlInr || 0), 0);
    const wonCount = predictions.filter((p) => p.status === "WON").length;
    const totalSettled = predictions.filter((p) => p.status !== "LIVE").length;
    const winRate = totalSettled > 0 ? Math.round((wonCount / totalSettled) * 100) : 0;

    return {
      totalInvested,
      liveProfits,
      winRate,
      activeCount: predictions.filter((p) => p.status === "LIVE").length,
    };
  }, [predictions]);

  return {
    activeTab,
    setActiveTab,
    predictions,
    isLoading,
    stats,
  };
}
