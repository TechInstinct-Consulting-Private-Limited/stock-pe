import { useState, useEffect, useMemo } from "react";
import {
  SAVED_WITHDRAWAL_ACCOUNTS,
  SUPPORTED_USDT_NETWORKS,
  USDT_INR_RATE,
  WALLET_SUMMARY_DATA,
  fetchWalletSummary,
  initiateWithdrawal,
} from "../services/walletService";

export function useWalletWithdraw() {
  const [wallet, setWallet] = useState(WALLET_SUMMARY_DATA);
  const [amount, setAmount] = useState("1468"); // ~20 USDT
  const [accounts, setAccounts] = useState(SAVED_WITHDRAWAL_ACCOUNTS);
  const [selectedAccountId, setSelectedAccountId] = useState(
    SAVED_WITHDRAWAL_ACCOUNTS[0]?.id || "acc_usdt_trc"
  );
  const [selectedNetwork, setSelectedNetwork] = useState("trc20");
  const [customAddress, setCustomAddress] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [withdrawResult, setWithdrawResult] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);

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

  const activeNetwork = useMemo(() => {
    return (
      SUPPORTED_USDT_NETWORKS.find((n) => n.id === selectedNetwork) ||
      SUPPORTED_USDT_NETWORKS[0]
    );
  }, [selectedNetwork]);

  const gasFeeUsdt = useMemo(() => {
    return activeNetwork.networkFeeUsdt || 1.0;
  }, [activeNetwork]);

  const netPayoutUsdt = useMemo(() => {
    const gross = parseFloat(usdtEquivalent) || 0;
    return Math.max(0, +(gross - gasFeeUsdt).toFixed(2));
  }, [usdtEquivalent, gasFeeUsdt]);

  const tdsCalculation = useMemo(() => {
    return {
      grossAmount: numAmount,
      grossUsdt: usdtEquivalent,
      gasFeeUsdt: gasFeeUsdt,
      netPayoutUsdt: netPayoutUsdt,
      netPayoutInr: Math.round(netPayoutUsdt * USDT_INR_RATE),
      network: activeNetwork.shortName,
    };
  }, [numAmount, usdtEquivalent, gasFeeUsdt, netPayoutUsdt, activeNetwork]);

  const isValidAmount = useMemo(() => {
    return (
      numAmount >= (wallet.minWithdrawInr || 734) &&
      numAmount <= (wallet.winningsBalanceInr || 0)
    );
  }, [numAmount, wallet]);

  const handleWithdrawSubmit = async () => {
    if (numAmount < (wallet.minWithdrawInr || 734)) {
      setErrorMessage(`Minimum withdrawal is $${wallet.minWithdrawUsdt || 10} USDT (₹${wallet.minWithdrawInr || 734})`);
      return;
    }

    if (numAmount > (wallet.winningsBalanceInr || 0)) {
      setErrorMessage(
        `Amount exceeds your withdrawable balance ($${wallet.winningsBalanceUsdt} USDT)`
      );
      return;
    }

    setErrorMessage("");
    setIsProcessing(true);

    const res = await initiateWithdrawal({
      amount: numAmount,
      accountId: selectedAccountId,
      destinationAddress: customAddress.trim() || null,
      networkId: selectedNetwork,
    });

    setIsProcessing(false);

    if (res.success) {
      setWithdrawResult(res.data);
      setShowSuccessModal(true);
    } else {
      setErrorMessage(res.error || "Withdrawal request failed");
    }
  };

  const handleSetMaxAmount = () => {
    setAmount(String(wallet.winningsBalanceInr || 0));
    setErrorMessage("");
  };

  const handleAddAccount = (newAcc) => {
    setAccounts((prev) => [...prev, newAcc]);
    setSelectedAccountId(newAcc.id);
    setShowAddAccountModal(false);
  };

  return {
    wallet,
    amount,
    setAmount,
    numAmount,
    usdtEquivalent,
    accounts,
    selectedAccountId,
    setSelectedAccountId,
    selectedNetwork,
    setSelectedNetwork,
    customAddress,
    setCustomAddress,
    activeNetwork,
    gasFeeUsdt,
    netPayoutUsdt,
    tdsCalculation,
    isValidAmount,
    handleSetMaxAmount,
    handleWithdrawSubmit,
    isProcessing,
    errorMessage,
    withdrawResult,
    showSuccessModal,
    setShowSuccessModal,
    showAddAccountModal,
    setShowAddAccountModal,
    handleAddAccount,
  };
}

