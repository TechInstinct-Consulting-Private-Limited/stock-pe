import { useState, useEffect } from "react";
import { fetchPlayerProfile } from "../services/leadersService";
import { PROFILE_USER_DATA } from "../../profile/services/profileService";

export function usePlayerDetail(playerId) {
  const [player, setPlayer] = useState(null);
  const [currentUser] = useState(PROFILE_USER_DATA);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    fetchPlayerProfile(playerId || "1").then((res) => {
      setIsLoading(false);
      if (res.success) {
        setPlayer(res.data);
      }
    });
  }, [playerId]);

  return {
    player,
    currentUser,
    isLoading,
  };
}
