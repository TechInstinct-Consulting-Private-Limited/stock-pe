import { useState, useEffect, useMemo } from "react";
import { submitTradeOrder } from "../services/eventsService";
import { calculateOrderMetrics, calculatePricePredictionMetrics } from "../../../utils/calculations";

export function useTradeExecution(event) {
  const [tradeMode, setTradeMode] = useState("PRICE_TARGET");
  const [selectedOption, setSelectedOption] = useState("YES");
  const [pricePerUnit, setPricePerUnit] = useState(event?.yesPrice || 6.2);
  const [targetPrice, setTargetPrice] = useState(
    event?.spotNumeric ? String(event.spotNumeric) : "24187.65"
  );
  const [quantity, setQuantity] = useState(25);
  const [walletBalance, setWalletBalance] = useState(1283.0);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [lastPlacedTrade, setLastPlacedTrade] = useState(null);

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

  const metrics = useMemo(() => {
    if (tradeMode === "PRICE_TARGET") {
      const spot = event?.spotNumeric || 24187.65;
      return calculatePricePredictionMetrics(quantity, spot, targetPrice, 10);
    }
    return calculateOrderMetrics(quantity, pricePerUnit);
  }, [tradeMode, quantity, pricePerUnit, targetPrice, event?.spotNumeric]);

  const handleIncrementTarget = (delta = 50) => {
    const spot = event?.spotNumeric || 24187.65;
    const current = parseFloat(targetPrice) || spot;
    const next = Math.round((current + delta) * 100) / 100;
    setTargetPrice(String(next));
  };

  const handlePlaceOrder = () => {
    const trade = submitTradeOrder({
      eventId: event?.id || "nifty-50",
      tradeMode,
      targetPrice: tradeMode === "PRICE_TARGET" ? Number(targetPrice) : null,
      multiplier: metrics?.multiplier || 2.0,
      delta: metrics?.delta || 0,
      option: selectedOption,
      quantity,
      pricePerUnit: tradeMode === "PRICE_TARGET" ? 10 : pricePerUnit,
      investedAmount: metrics?.investment || 199,
      potentialPayout: metrics?.potentialPayout || 400000,
    });

    setLastPlacedTrade(trade);
    setWalletBalance((prev) => Math.max(0, prev - (metrics?.investment || 199)));
    setIsSuccessModalVisible(true);
    return trade;
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
  };
}
