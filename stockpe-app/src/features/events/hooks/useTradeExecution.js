import { useState, useEffect, useMemo } from "react";
import { calculateOrderMetrics, calculatePricePredictionMetrics } from "../../../utils/calculations";
import { getDemoCreditBalance, getDemoUsdtWallet, getMyDemoContests, getUserFacingError, joinDemoContest } from "../../../services/api";

export function useTradeExecution(event) {
  const [tradeMode, setTradeMode] = useState("PRICE_TARGET");
  const [selectedOption, setSelectedOption] = useState("YES");
  const [pricePerUnit, setPricePerUnit] = useState(event?.yesPrice || 6.2);
  const [targetPrice, setTargetPrice] = useState(
    event?.spotNumeric ? String(event.spotNumeric) : ""
  );
  const [quantity, setQuantity] = useState(25);
  const [walletBalance, setWalletBalance] = useState(null);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [lastPlacedTrade, setLastPlacedTrade] = useState(null);
  const [hasJoined, setHasJoined] = useState(false);

  useEffect(() => {
    if (event?.spotNumeric) {
      setTargetPrice(String(event.spotNumeric));
    }
  }, [event?.id, event?.spotNumeric]);

  useEffect(() => {
    if (selectedOption === "YES") {
      setPricePerUnit(event?.yesPrice || 6.2);
    } else {
      setPricePerUnit(event?.noPrice || 3.8);
    }
  }, [selectedOption, event]);

  useEffect(() => {
    let mounted = true;
    getMyDemoContests("ALL")
      .then((response) => {
        if (mounted) setHasJoined((response.entries || []).some((entry) => entry.public_id === event?.id));
      })
      .catch(() => { if (mounted) setHasJoined(false); });
    return () => { mounted = false; };
  }, [event?.id]);

  useEffect(() => {
    let mounted = true;
    (event?.currency === 'DEMO_USDT' ? getDemoUsdtWallet() : getDemoCreditBalance())
      .then((response) => {
        if (mounted) setWalletBalance(Number(event?.currency === 'DEMO_USDT' ? response.available : response.availableCredits));
      })
      .catch(() => {
        if (mounted) setWalletBalance(null);
      });
    return () => { mounted = false; };
  }, [event?.id, event?.currency]);

  const canJoin = event?.status === "OPEN" && !hasJoined;
  const joinMessage = hasJoined
    ? "ALREADY JOINED"
    : event?.status === "SOON"
      ? "OPENS SOON"
      : event?.status === "OPEN"
        ? "JOIN CONTEST"
        : "ENTRY CLOSED";

  const metrics = useMemo(() => {
    if (tradeMode === "PRICE_TARGET") {
      const spot = event?.spotNumeric || 0;
      return calculatePricePredictionMetrics(quantity, spot, targetPrice, 10);
    }
    return calculateOrderMetrics(quantity, pricePerUnit);
  }, [tradeMode, quantity, pricePerUnit, targetPrice, event?.spotNumeric]);

  const handleIncrementTarget = (delta = 50) => {
    const spot = event?.spotNumeric || 0;
    const current = parseFloat(targetPrice) || spot;
    const next = Math.round((current + delta) * 100) / 100;
    setTargetPrice(String(next));
  };

  const handlePlaceOrder = async () => {
    try {
      const response = await joinDemoContest(event?.id || "nifty-50", Number(targetPrice));
      const trade = {
        tradeId: response.entry.id,
        eventId: response.entry.contestId,
        title: response.entry.contestTitle,
        status: response.entry.status,
        currency: event?.currency,
        timestamp: response.entry.joinedAt,
        targetPrice: Number(targetPrice),
        option: selectedOption,
      };
      setLastPlacedTrade(trade);
      setHasJoined(true);
      setWalletBalance((prev) => prev === null ? prev : Math.max(0, prev - response.entry.entryCredits));
      setIsSuccessModalVisible(true);
      return trade;
    } catch (error) {
      return { error: getUserFacingError(error, "Unable to submit this demo prediction.") };
    }
  };

  const closeSuccessModal = () => {
    setIsSuccessModalVisible(false);
  };

  return {
    tradeMode,
    setTradeMode,
    targetPrice,
    setTargetPrice,
    handleIncrementTarget,
    selectedOption,
    setSelectedOption,
    pricePerUnit,
    setPricePerUnit,
    quantity,
    setQuantity,
    metrics,
    walletBalance,
    isSuccessModalVisible,
    lastPlacedTrade,
    handlePlaceOrder,
    closeSuccessModal,
    canJoin,
    joinMessage,
  };
}
