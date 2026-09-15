import { useState, useEffect, useMemo } from "react";
import {
  PAYMENT_METHODS,
  PROMO_COUPONS,
  SUPPORTED_USDT_NETWORKS,
  USDT_INR_RATE,
  WALLET_SUMMARY_DATA,
  fetchWalletSummary,
  initiateDeposit,
  validateCouponCode,
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
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const quickAmounts = [
    { label: "+10 USDT", value: "734", usdt: "10" },
    { label: "+25 USDT", value: "1835", usdt: "25", isPopular: true },
    { label: "+50 USDT", value: "3671", usdt: "50" },
    { label: "+100 USDT", value: "7342", usdt: "100" },
    { label: "+250 USDT", value: "18355", usdt: "250" },
  ];

  useEffect(() => {
    fetchWalletSummary().then((res) => {
      if (res.success) setWallet(res.data);
    });
  }, []);

  const numAmount = useMemo(() => {
    const parsed = parseFloat(amount);
    return isNaN(parsed) ? 0 : parsed;
  }, [amount]);

  const usdtEquivalent = useMemo(() => {
    return (numAmount / USDT_INR_RATE).toFixed(2);
  }, [numAmount]);

  const calculatedBonus = useMemo(() => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.calculatedBonus) return appliedCoupon.calculatedBonus;
    if (appliedCoupon.discountPercent) {
      return Math.min(
        (numAmount * appliedCoupon.discountPercent) / 100,
        appliedCoupon.maxBonusInr || 3670
      );
    }
    return 0;
  }, [appliedCoupon, numAmount]);

  const calculatedBonusUsdt = useMemo(() => {
    return +(calculatedBonus / USDT_INR_RATE).toFixed(2);
  }, [calculatedBonus]);

  const totalEffectiveCredit = useMemo(() => {
    return numAmount + calculatedBonus;
  }, [numAmount, calculatedBonus]);

  const totalEffectiveCreditUsdt = useMemo(() => {
    return +(totalEffectiveCredit / USDT_INR_RATE).toFixed(2);
  }, [totalEffectiveCredit]);

  const handleSelectQuickAmount = (val) => {
    setAmount(val);
    setErrorMessage("");
  };

  const handleApplyCoupon = async (codeToApply) => {
    const code = codeToApply || couponCode;
    if (!code.trim()) {
      setCouponError("Please enter a coupon code");
      return;
    }
    setIsApplyingCoupon(true);
    setCouponError("");

    const res = await validateCouponCode(code, numAmount);
    setIsApplyingCoupon(false);

    if (res.success) {
      setAppliedCoupon(res.data);
      setCouponCode(res.data.code);
      setCouponError("");
    } else {
      setCouponError(res.error || "Failed to apply coupon");
      setAppliedCoupon(null);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
  };

  const handleDepositSubmit = async () => {
    if (numAmount < (wallet.minDepositInr || 367)) {
      setErrorMessage(`Minimum deposit is $${wallet.minDepositUsdt || 5} USDT (₹${wallet.minDepositInr || 367})`);
      return;
    }

    setErrorMessage("");
    setIsProcessing(true);

    const res = await initiateDeposit({
      amount: numAmount,
      networkId: selectedNetwork,
      couponCode: appliedCoupon ? appliedCoupon.code : null,
      txHash: txHash.trim() || null,
    });

    setIsProcessing(false);

    if (res.success) {
      setDepositResult(res.data);
      setShowSuccessModal(true);
    } else {
      setErrorMessage(res.error || "Deposit confirmation failed. Please try again.");
    }
  };

  return {
    wallet,
    amount,
    setAmount,
    numAmount,
    usdtEquivalent,
    quickAmounts,
    handleSelectQuickAmount,
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
    calculatedBonusUsdt,
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
  };
}

