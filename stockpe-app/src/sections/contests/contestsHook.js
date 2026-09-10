import { useState, useMemo, useCallback } from "react";
import {
  fetchContestById,
  fetchStockCatalog,
  fetchJoinedContests,
  joinContestWithTeam,
} from "./contestsService";

export function useContestDetail(contestId) {
  const [activeTab, setActiveTab] = useState("prizes"); // "prizes" | "rules" | "leaderboard"

  const contest = useMemo(() => {
    return fetchContestById(contestId);
  }, [contestId]);

  return {
    contest,
    activeTab,
    setActiveTab,
  };
}

export function useTeamBuilder(contestId) {
  const contest = useMemo(() => fetchContestById(contestId), [contestId]);
  const [selectedStocks, setSelectedStocks] = useState([]); // [{ symbol, name, price, credits, type: "LONG"|"SHORT" }]
  const [captain, setCaptain] = useState(null); // symbol
  const [viceCaptain, setViceCaptain] = useState(null); // symbol
  const [selectedSector, setSelectedSector] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [joinedEntry, setJoinedEntry] = useState(null);

  const totalCreditsAllowed = 100.0;
  const maxStocksCount = 6;

  const stocksCatalog = useMemo(() => {
    return fetchStockCatalog(selectedSector).filter(
      (s) =>
        s.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [selectedSector, searchQuery]);

  // Credit calculation
  const creditsUsed = useMemo(() => {
    return selectedStocks.reduce((acc, s) => acc + (s.credits || 0), 0);
  }, [selectedStocks]);

  const creditsRemaining = Math.round((totalCreditsAllowed - creditsUsed) * 10) / 10;

  // Long & Short counts
  const longCount = selectedStocks.filter((s) => s.type === "LONG").length;
  const shortCount = selectedStocks.filter((s) => s.type === "SHORT").length;

  const isStockSelected = useCallback(
    (symbol) => selectedStocks.some((s) => s.symbol === symbol),
    [selectedStocks]
  );

  const toggleSelectStock = (stock, defaultType = "LONG") => {
    if (isStockSelected(stock.symbol)) {
      setSelectedStocks((prev) => prev.filter((s) => s.symbol !== stock.symbol));
      if (captain === stock.symbol) setCaptain(null);
      if (viceCaptain === stock.symbol) setViceCaptain(null);
    } else {
      if (selectedStocks.length >= maxStocksCount) {
        alert(`You can select a maximum of ${maxStocksCount} stocks.`);
        return;
      }
      if (creditsRemaining < stock.credits) {
        alert("Not enough credits remaining for this stock!");
        return;
      }
      setSelectedStocks((prev) => [
        ...prev,
        { ...stock, type: defaultType },
      ]);
    }
  };

  const setStockType = (symbol, type) => {
    setSelectedStocks((prev) =>
      prev.map((s) => (s.symbol === symbol ? { ...s, type } : s))
    );
  };

  const selectCaptain = (symbol) => {
    if (viceCaptain === symbol) setViceCaptain(null);
    setCaptain(symbol);
  };

  const selectViceCaptain = (symbol) => {
    if (captain === symbol) setCaptain(null);
    setViceCaptain(symbol);
  };

  const isTeamValid =
    selectedStocks.length === maxStocksCount &&
    creditsUsed <= totalCreditsAllowed &&
    captain !== null &&
    viceCaptain !== null;

  const handleJoinContest = () => {
    if (!isTeamValid) {
      alert("Please select 6 stocks, 1 Captain (2x), and 1 Vice-Captain (1.5x).");
      return;
    }

    const entry = joinContestWithTeam({
      contestId,
      teamName: "My Alpha Team",
      selectedStocks,
      captain,
      viceCaptain,
    });

    setJoinedEntry(entry);
    setIsPreviewVisible(false);
    setIsSuccessModalVisible(true);
  };

  return {
    contest,
    stocksCatalog,
    selectedStocks,
    selectedSector,
    setSelectedSector,
    searchQuery,
    setSearchQuery,
    creditsUsed,
    creditsRemaining,
    maxStocksCount,
    longCount,
    shortCount,
    captain,
    viceCaptain,
    selectCaptain,
    selectViceCaptain,
    isStockSelected,
    toggleSelectStock,
    setStockType,
    isTeamValid,
    isPreviewVisible,
    setIsPreviewVisible,
    isSuccessModalVisible,
    setIsSuccessModalVisible,
    joinedEntry,
    handleJoinContest,
  };
}

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
