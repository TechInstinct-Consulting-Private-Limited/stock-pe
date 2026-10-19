import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  PAYMENT_METHODS,
  PROMO_COUPONS,
  SUPPORTED_USDT_NETWORKS,
  USDT_INR_RATE,
  WALLET_SUMMARY_DATA,
  fetchWalletSummary,
  initiateDeposit,
  validateCouponCode,
  checkPaymentStatus,
  simulateSandboxWebhook,
} from "../services/walletService";

export function useWalletDeposit() {
  const [wallet, setWallet] = useState(WALLET_SUMMARY_DATA);
  const [amount, setAmount] = useState("1835"); // ~25 USDT
  const [selectedNetwork, setSelectedNetwork] = useState("trc20");
  const [txHash, setTxHash] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [depositResult, setDepositResult] = useState(null);
  const [orderStatus, setOrderStatus] = useState("idle");
  const [isSimulating, setIsSimulating] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const pollerRef = useRef(null);

  const quickAmounts = [
    { label: "+10 USDT", value: "734", usdt: "10" },
    { label: "+25 USDT", value: "1835", usdt: "25", isPopular: true },
    { label: "+50 USDT", value: "3671", usdt: "50" },
    { label: "+100 USDT", value: "7342", usdt: "100" },
    { label: "+250 USDT", value: "18355", usdt: "250" },
  ];

  const refreshBalance = useCallback(async () => {
    const res = await fetchWalletSummary();
    if (res.success && res.data) setWallet(res.data);
  }, []);

  useEffect(() => {
    refreshBalance();
    return () => {
      if (pollerRef.current) clearInterval(pollerRef.current);
    };
  }, [refreshBalance]);

  const numAmount = useMemo(() => {
    const val = parseFloat(amount);
    return isNaN(val) ? 0 : val;
  }, [amount]);

  const usdtEquivalent = useMemo(
    () => (numAmount / USDT_INR_RATE).toFixed(2),
    [numAmount]
  );

  const calculatedBonus = useMemo(() => {
    if (!appliedCoupon?.discountPercent) return 0;
    return Math.min(
      (numAmount * appliedCoupon.discountPercent) / 100,
      appliedCoupon.maxBonusInr || 3670
    );
  }, [appliedCoupon, numAmount]);

  const totalEffectiveCredit = useMemo(
    () => numAmount + calculatedBonus,
    [numAmount, calculatedBonus]
  );

  const totalEffectiveCreditUsdt = useMemo(
    () => +(totalEffectiveCredit / USDT_INR_RATE).toFixed(2),
    [totalEffectiveCredit]
  );

  const handleApplyCoupon = async (code) => {
    const c = (code || couponCode).trim();
    if (!c) return setCouponError("Please enter a coupon code");
    setIsApplyingCoupon(true);
    setCouponError("");
    const res = await validateCouponCode(c, numAmount);
    setIsApplyingCoupon(false);
    if (res.success) {
      setAppliedCoupon(res.data);
      setCouponCode(res.data.code);
    } else {
      setCouponError(res.error || "Invalid coupon");
      setAppliedCoupon(null);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
  };

  const onFinished = useCallback(
    async (finalOrder) => {
      if (pollerRef.current) clearInterval(pollerRef.current);
      setOrderStatus("finished");
      setDepositResult(finalOrder);
      await refreshBalance();
      setShowSuccessModal(true);
    },
    [refreshBalance]
  );

  // Poll active payment status
  useEffect(() => {
    if (!depositResult?.paymentId || orderStatus === "finished") return;

    pollerRef.current = setInterval(async () => {
      try {
        const res = await checkPaymentStatus(depositResult.paymentId);
        if (res.success) {
          setOrderStatus(res.status);
          if (res.status === "finished" || res.isCompleted) {
            onFinished({ ...depositResult, status: "finished" });
          }
        }
      } catch (e) {
        console.log("[useWalletDeposit] Poll error:", e.message);
      }
    }, 4000);

    return () => {
      if (pollerRef.current) clearInterval(pollerRef.current);
    };
  }, [depositResult, orderStatus, onFinished]);

  // Initiate deposit
  const handleDepositSubmit = async () => {
    if (numAmount < (wallet.minDepositInr || 367)) {
      setErrorMessage(`Minimum deposit is $${wallet.minDepositUsdt || 5} USDT`);
      return;
    }
    setErrorMessage("");
    setIsProcessing(true);

    const res = await initiateDeposit({
      amount: numAmount,
      networkId: selectedNetwork,
      couponCode: appliedCoupon?.code || null,
      txHash: txHash.trim() || null,
    });
    setIsProcessing(false);

    if (res.success && res.data) {
      setDepositResult(res.data);
      setOrderStatus(res.data.status || "waiting");
    } else {
      setErrorMessage(res.error || "Deposit failed. Please try again.");
    }
  };

  // Instant sandbox confirmation test
  const handleSimulateConfirm = async () => {
    if (!depositResult?.paymentId) return;
    setIsSimulating(true);
    try {
      await simulateSandboxWebhook(
        depositResult.paymentId,
        depositResult.amountUsdt,
        depositResult.payCurrency || "usdttrc20"
      );
      setTimeout(async () => {
        const res = await checkPaymentStatus(depositResult.paymentId);
        if (res.status === "finished" || res.isCompleted) {
          onFinished({ ...depositResult, status: "finished" });
        }
        setIsSimulating(false);
      }, 1000);
    } catch {
      setIsSimulating(false);
    }
  };

  const handleResetOrder = () => {
    if (pollerRef.current) clearInterval(pollerRef.current);
    setDepositResult(null);
    setOrderStatus("idle");
  };

  return {
    wallet,
    amount,
    setAmount,
    numAmount,
    usdtEquivalent,
    quickAmounts,
    handleSelectQuickAmount: (val) => { setAmount(val); setErrorMessage(""); },
    paymentMethods: PAYMENT_METHODS,
    selectedNetwork,
    setSelectedNetwork,
    txHash,
    setTxHash,
    promoCoupons: PROMO_COUPONS,
    couponCode,
    setCouponCode,
    appliedCoupon,
    couponError,
    isApplyingCoupon,
    calculatedBonus,
    calculatedBonusUsdt: +(calculatedBonus / USDT_INR_RATE).toFixed(2),
    totalEffectiveCredit,
    totalEffectiveCreditUsdt,
    handleApplyCoupon,
    handleRemoveCoupon,
    handleDepositSubmit,
    isProcessing,
    errorMessage,
    showSuccessModal,
    setShowSuccessModal,
    depositResult,
    orderStatus,
    isSimulating,
    handleSimulateConfirm,
    handleResetOrder,
  };
}
