import { useEffect, useMemo, useState } from "react";
import {
  ensureMockDepositAddress,
  fetchWalletSummary,
  initiateDeposit,
  PAYMENT_METHODS,
  PROMO_COUPONS,
  USDT_INR_RATE,
  validateCouponCode,
  WALLET_SUMMARY_DATA,
} from "../services/walletService";

export function useWalletDeposit() {
  const [wallet, setWallet] = useState(WALLET_SUMMARY_DATA);
  const [amount, setAmount] = useState("734");
  const [selectedNetwork, setSelectedNetwork] = useState("trc20");
  const [txHash, setTxHash] = useState("");
  const [depositAddress, setDepositAddress] = useState(null);
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [depositResult, setDepositResult] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function load() {
      const result = await fetchWalletSummary();
      if (result.success) setWallet(result.data);
      else setErrorMessage(result.error);
      try { setDepositAddress(await ensureMockDepositAddress()); }
      catch (error) { setErrorMessage(error.message || "Demo deposit address is unavailable"); }
    }
    load();
  }, []);

  const numAmount = useMemo(() => Number(amount) || 0, [amount]);
  const usdtEquivalent = useMemo(() => (numAmount / USDT_INR_RATE).toFixed(2), [numAmount]);
  const quickAmounts = [10, 25, 50, 100].map((usdt) => ({
    label: `+${usdt} USDT`, value: String(Math.round(usdt * USDT_INR_RATE)), usdt: String(usdt), isPopular: usdt === 25,
  }));
  const handleSelectQuickAmount = (value) => { setAmount(value); setErrorMessage(""); };
  const handleApplyCoupon = async (code) => {
    setIsApplyingCoupon(true);
    const result = await validateCouponCode(code || couponCode, numAmount);
    setCouponError(result.error || "Promotions are unavailable in demo mode");
    setIsApplyingCoupon(false);
  };
  const handleRemoveCoupon = () => { setCouponCode(""); setCouponError(""); };
  const handleDepositSubmit = async () => {
    if (numAmount <= 0) { setErrorMessage("Enter a valid deposit amount"); return; }
    setErrorMessage(""); setIsProcessing(true);
    const result = await initiateDeposit({ amount: numAmount });
    setIsProcessing(false);
    if (result.success) { setDepositResult(result.data); setShowSuccessModal(true); }
    else setErrorMessage(result.error || "Demo deposit failed");
  };

  return {
    wallet, amount, setAmount, numAmount, usdtEquivalent, quickAmounts,
    handleSelectQuickAmount, paymentMethods: PAYMENT_METHODS, selectedNetwork,
    setSelectedNetwork, txHash, setTxHash, depositAddress, promoCoupons: PROMO_COUPONS,
    couponCode, setCouponCode, appliedCoupon: null, couponError, isApplyingCoupon,
    calculatedBonus: 0, calculatedBonusUsdt: 0, totalEffectiveCredit: numAmount,
    totalEffectiveCreditUsdt: Number(usdtEquivalent), handleApplyCoupon,
    handleRemoveCoupon, handleDepositSubmit, isProcessing, errorMessage,
    showSuccessModal, setShowSuccessModal, depositResult,
  };
}
