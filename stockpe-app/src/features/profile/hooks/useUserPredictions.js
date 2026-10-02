import { useState, useEffect, useMemo } from "react";
import { fetchUserPredictions } from "../services/profileService";

export function useUserPredictions() {
  const [activeTab, setActiveTab] = useState("ALL");
  const [predictions, setPredictions] = useState([]);
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
    const totalEntryCredits = predictions.reduce((acc, p) => acc + (p.entryCredits || 0), 0);
    const totalRewardCredits = predictions.reduce((acc, p) => acc + (p.rewardCredits || 0), 0);
    const wonCount = predictions.filter((p) => p.status === "WON").length;
    const totalSettled = predictions.filter((p) => p.status !== "ACTIVE").length;
    const winRate = totalSettled > 0 ? Math.round((wonCount / totalSettled) * 100) : 0;

    return {
      totalEntryCredits,
      totalRewardCredits,
      winRate,
      activeCount: predictions.filter((p) => p.status === "ACTIVE").length,
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
