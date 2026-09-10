import { useState, useEffect, useMemo, useCallback } from "react";
import { fetchUserTrades, executeExitTrade } from "../services/eventsService";
import { calculatePortfolioMetrics } from "../../../utils/calculations";

export function useUserPositions() {
  const [trades, setTrades] = useState([]);
  const [activeTab, setActiveTab] = useState("ACTIVE"); // "ACTIVE" | "SETTLED"
  const [selectedTradeToExit, setSelectedTradeToExit] = useState(null);
  const [isExitModalVisible, setIsExitModalVisible] = useState(false);

  const refreshTrades = useCallback(() => {
    setTrades(fetchUserTrades());
  }, []);

  useEffect(() => {
    refreshTrades();
  }, [refreshTrades]);

  const portfolio = useMemo(() => {
    return calculatePortfolioMetrics(trades);
  }, [trades]);

  const settledTrades = useMemo(() => {
    return trades.filter((t) => t.status !== "ACTIVE");
  }, [trades]);

  const openExitModal = (trade) => {
    setSelectedTradeToExit(trade);
    setIsExitModalVisible(true);
  };

  const closeExitModal = () => {
    setIsExitModalVisible(false);
    setSelectedTradeToExit(null);
  };

  const confirmExitTrade = () => {
    if (selectedTradeToExit) {
      executeExitTrade(selectedTradeToExit.tradeId);
      closeExitModal();
      refreshTrades();
    }
  };

  return {
    trades,
    activeTab,
    setActiveTab,
    activeTrades: portfolio.activeTrades,
    settledTrades,
    portfolio,
    selectedTradeToExit,
    isExitModalVisible,
    openExitModal,
    closeExitModal,
    confirmExitTrade,
    refreshTrades,
  };
}
