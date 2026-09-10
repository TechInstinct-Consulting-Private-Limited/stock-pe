import { useState, useEffect } from "react";
import {
  USER_WINNINGS_DATA,
  fetchUserWinnings,
} from "../services/profileService";

export function useUserWinnings() {
  const [winningsData, setWinningsData] = useState(USER_WINNINGS_DATA);
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
