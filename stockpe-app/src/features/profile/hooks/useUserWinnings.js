import { useState, useEffect } from "react";
import { fetchUserWinnings } from "../services/profileService";

export function useUserWinnings() {
  const [winningsData, setWinningsData] = useState({ totalRewardCredits: 0, winCount: 0, topWins: [] });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    fetchUserWinnings().then((res) => {
      setIsLoading(false);
      if (res.success) {
        setWinningsData(res.data);
      }
    });
  }, []);

  return {
    winningsData,
    isLoading,
  };
}
