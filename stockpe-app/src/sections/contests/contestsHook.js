import { useState, useMemo, useCallback, useEffect } from "react";
import { useFocusEffect } from "expo-router";
import { getMyDemoContests, joinDemoContest } from "../../services/api";
import {
  fetchContestById,
  fetchStockCatalog,
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
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState("");

  const demoContestIds = {
    "nifty-mega-pool": "nifty-50",
    "bank-nifty-sprint": "bank-nifty",
  };

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

  const handleJoinContest = async () => {
    if (!isTeamValid) {
      alert("Please select 6 stocks, 1 Captain (2x), and 1 Vice-Captain (1.5x).");
      return;
    }

    const demoContestId = demoContestIds[contestId];
    if (!demoContestId) {
      setJoinError("This contest is not available in demo mode yet.");
      return;
    }

    setIsJoining(true);
    setJoinError("");
    try {
      const response = await joinDemoContest(demoContestId);
      setJoinedEntry(response.entry);
      setIsPreviewVisible(false);
      setIsSuccessModalVisible(true);
    } catch (error) {
      setJoinError(error.message || "Unable to join this demo contest.");
    } finally {
      setIsJoining(false);
    }
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
    isJoining,
    joinError,
    handleJoinContest,
  };
}

export function useMyContests() {
  const [activeFilter, setActiveFilter] = useState("ALL"); // "ALL" | "ACTIVE" | "WON" | "LOST"
  const [joinedList, setJoinedList] = useState([]);

  const refreshContests = useCallback(async () => {
    const response = await getMyDemoContests(activeFilter);
    setJoinedList((response.entries || []).map((entry) => ({
      joinId: entry.id,
      contestId: entry.public_id,
      indexSymbol: entry.title,
      contestTitle: entry.title,
      status: entry.status,
      timestamp: new Date(entry.joined_at).toLocaleString("en-IN"),
      currency: entry.currency || "DEMO_CREDITS",
      entryFeeInr: `${entry.entry_credits} ${entry.currency === "DEMO_USDT" ? "Demo USDT" : "Credits"}`,
      entryFeeUsdt: entry.currency === "DEMO_USDT" ? "Simulated" : "Demo credits",
      predictionValue: entry.prediction_value === null ? null : Number(entry.prediction_value),
      rewardCredits: Number(entry.currency === "DEMO_USDT" ? entry.demo_usdt_reward : entry.reward_credits || 0),
      prediction: entry.prediction_value === null
        ? "Not submitted"
        : Number(entry.prediction_value).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      prizeInr: Number(entry.currency === "DEMO_USDT" ? entry.demo_usdt_reward : entry.reward_credits || 0) > 0 ? `${entry.currency === "DEMO_USDT" ? entry.demo_usdt_reward : entry.reward_credits} ${entry.currency === "DEMO_USDT" ? "Demo USDT" : "Credits"}` : null,
      prizeUsdt: entry.status === "WON" ? "Demo reward" : null,
      accuracy: null,
    })));
  }, [activeFilter]);

  useEffect(() => {
    refreshContests().catch(() => {});
  }, [refreshContests]);

  useFocusEffect(
    useCallback(() => {
      refreshContests().catch(() => {});
      const timer = setInterval(() => {
        refreshContests().catch(() => {});
      }, 30_000);
      return () => clearInterval(timer);
    }, [refreshContests])
  );

  const filteredContests = joinedList;

  const summary = useMemo(() => {
    const totalJoined = joinedList.length;
    const active = joinedList.filter((i) => i.status === "ACTIVE").length;
    const won = joinedList.filter((i) => i.status.includes("WON")).length;
    const lost = joinedList.filter((i) => i.status === "LOST").length;
    const currencies = new Set(joinedList.map((item) => item.currency));
    const unit = currencies.size > 1 ? null : currencies.has("DEMO_USDT") ? "Demo USDT" : "Credits";

    return {
      totalJoined,
      active,
      won,
      lost,
      totalSpent: unit ? `${joinedList.reduce((total, item) => total + Number(String(item.entryFeeInr).split(" ")[0]), 0)} ${unit}` : "Mixed demo units",
      totalWon: unit ? `${joinedList.reduce((total, item) => total + item.rewardCredits, 0)} ${unit}` : "Mixed demo units",
      netPnl: unit ? `${joinedList.reduce((total, item) => total + item.rewardCredits - Number(String(item.entryFeeInr).split(" ")[0]), 0)} ${unit}` : "Mixed demo units",
    };
  }, [joinedList]);

  return {
    activeFilter,
    setActiveFilter,
    filteredContests,
    summary,
    refreshContests,
  };
}
