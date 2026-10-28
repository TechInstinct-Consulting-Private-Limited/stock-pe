import { useState, useEffect } from "react";
import { fetchPlayerProfile } from "../services/leadersService";

export function usePlayerDetail(playerId) {
  const [player, setPlayer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(true);
      setError("");
      fetchPlayerProfile(playerId).then((res) => {
        setIsLoading(false);
        if (res.success) {
          setPlayer(res.data);
        } else {
          setError(res.message || "Could not load player profile.");
        }
      });
    }, 0);
    return () => clearTimeout(timer);
  }, [playerId]);

  return {
    player,
    isLoading,
    error,
  };
}
