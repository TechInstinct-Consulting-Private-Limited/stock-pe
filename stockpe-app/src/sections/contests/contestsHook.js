import { useState, useMemo } from "react";
import { fetchJoinedContests } from "./contestsService";


export function useMyContests() {
  const [activeFilter, setActiveFilter] = useState("ALL"); // "ALL" | "ACTIVE" | "WON" | "LOST"
  const joinedList = useMemo(() => fetchJoinedContests(), []);

  const filteredContests = useMemo(() => {
    return joinedList.filter((item) => {
      if (activeFilter === "ALL") return true;
      if (activeFilter === "ACTIVE") return item.status === "LIVE";
      if (activeFilter === "WON") return item.status.includes("WON");
      if (activeFilter === "LOST") return item.status === "LOST";
      return true;
    });
  }, [joinedList, activeFilter]);

  const summary = useMemo(() => {
    const totalJoined = joinedList.length;
    const active = joinedList.filter((i) => i.status === "LIVE").length;
    const won = joinedList.filter((i) => i.status.includes("WON")).length;
    const lost = joinedList.filter((i) => i.status === "LOST").length;

    return {
      totalJoined,
      active,
      won,
      lost,
      totalSpent: "₹248",
      totalWon: "₹45,000",
      netPnl: "+₹44,752",
    };
  }, [joinedList]);

  return {
    activeFilter,
    setActiveFilter,
    filteredContests,
    summary,
  };
}
