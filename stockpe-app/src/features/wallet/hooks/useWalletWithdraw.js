import { useEffect, useMemo, useState } from "react";
import { fetchWalletSummary, initiateWithdrawal, SUPPORTED_USDT_NETWORKS, USDT_INR_RATE, WALLET_SUMMARY_DATA } from "../services/walletService";

const maskAddress = (value = "") => value.length > 12 ? `${value.slice(0, 6)}••••${value.slice(-4)}` : value;

export function useWalletWithdraw() {
  const [wallet, setWallet] = useState(WALLET_SUMMARY_DATA);
  const [amount, setAmount] = useState("");
  const [accounts, setAccounts] = useState([]);
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [withdrawResult, setWithdrawResult] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    fetchWalletSummary().then((result) => {
      if (!result.success) { setErrorMessage(result.error); return; }
      setWallet(result.data);
      if (result.data.linkedWallet) {
        const account = { id: result.data.linkedWallet.id, type: "CRYPTO", network: "TRC-20", networkId: "trc20", walletAddress: result.data.linkedWallet.address, walletAddressMasked: maskAddress(result.data.linkedWallet.address), label: "Verified linked wallet", isPrimary: true, isVerified: true };
        setAccounts([account]); setSelectedAccountId(account.id);
      }
    });
  }, []);

  const numAmount = useMemo(() => Number(amount) || 0, [amount]);
  const usdtEquivalent = useMemo(() => (numAmount / USDT_INR_RATE).toFixed(2), [numAmount]);
  const activeNetwork = SUPPORTED_USDT_NETWORKS[0];
  const netPayoutUsdt = Number(usdtEquivalent);
  const tdsCalculation = { grossAmount: numAmount, grossUsdt: usdtEquivalent, gasFeeUsdt: 0, netPayoutUsdt, netPayoutInr: Math.round(netPayoutUsdt * USDT_INR_RATE), network: "TRC-20" };
  const isValidAmount = numAmount > 0 && numAmount <= wallet.winningsBalanceInr && accounts.length > 0;
  const handleWithdrawSubmit = async () => {
    if (!isValidAmount) { setErrorMessage("Enter an amount within your available balance and use the verified linked TRC20 wallet"); return; }
    setErrorMessage(""); setIsProcessing(true);
    const result = await initiateWithdrawal({ amount: numAmount });
    setIsProcessing(false);
    if (result.success) { setWithdrawResult(result.data); setShowSuccessModal(true); }
    else setErrorMessage(result.error || "Demo withdrawal failed");
  };
  return { wallet, amount, setAmount, usdtEquivalent, accounts, selectedAccountId, setSelectedAccountId, selectedNetwork: "trc20", setSelectedNetwork: () => {}, customAddress: "", setCustomAddress: () => {}, activeNetwork, gasFeeUsdt: 0, netPayoutUsdt, tdsCalculation, isValidAmount, handleSetMaxAmount: () => setAmount(String(wallet.winningsBalanceInr)), handleWithdrawSubmit, isProcessing, errorMessage, withdrawResult, showSuccessModal, setShowSuccessModal, showAddAccountModal: false, setShowAddAccountModal: () => {}, handleAddAccount: () => {} };
}
