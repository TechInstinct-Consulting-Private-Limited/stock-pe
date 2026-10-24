// UI adapter for the wallet backend. The mock provider is selected only by
// server configuration; this app never creates a fake balance locally.
import {
  createMockDepositAddress,
  getUsdtWallet,
  getDemoUsdtWallet,
  getWalletPaymentSummary,
  simulateMockDeposit,
  simulateMockWithdrawal,
} from "../../../services/api";

export const USDT_INR_RATE = 73.42;
export const WALLET_SUMMARY_DATA = {
  totalBalanceInr: 0,
  totalBalanceUsdt: 0,
  depositBalanceInr: 0,
  depositBalanceUsdt: 0,
  winningsBalanceInr: 0,
  winningsBalanceUsdt: 0,
  bonusBalanceInr: 0,
  bonusBalanceUsdt: 0,
  lockedInContestsInr: 0,
  lockedInContestsUsdt: 0,
  kycVerified: false,
  minDepositUsdt: 0.01,
  minDepositInr: 1,
  maxDepositUsdt: 50000,
  minWithdrawUsdt: 0.01,
  minWithdrawInr: 1,
  maxWithdrawDailyUsdt: 10000,
  tdsPercent: 0,
};

export const SUPPORTED_USDT_NETWORKS = [
  {
    id: "trc20",
    name: "TRON (TRC20) · Demo",
    shortName: "TRC-20",
    depositAddress: "",
    networkFeeUsdt: 0,
    confirmationTime: "Instant mock confirmation",
    minDepositUsdt: 0.01,
    badge: "Demo",
    badgeColor: "#00C987",
    icon: "flash",
  },
];

export const PAYMENT_METHODS = [
  {
    id: "usdt_crypto",
    name: "USDT Crypto Wallet",
    description: "Deposit via TRC-20, BEP-20 or Polygon",
    icon: "wallet",
    iconColor: "#00C987",
    category: "CRYPTO",
    badge: "Instant Credit",
    processingFee: "Zero gateway fees",
    supportedNetworks: SUPPORTED_USDT_NETWORKS,
  },
];

export const SAVED_WITHDRAWAL_ACCOUNTS = [];
export const PROMO_COUPONS = [];
export const TRANSACTIONS_DATA = [];

// Async API Service Mock Handlers
export async function fetchWalletSummary() {
  try {
    const [summary, linkedWallet] = await Promise.all([
      getWalletPaymentSummary(),
      getUsdtWallet(),
    ]);
    const balance = Number(summary.availableBalanceUsdt || 0);
    return {
      success: true,
      data: {
        ...WALLET_SUMMARY_DATA,
        totalBalanceUsdt: balance,
        totalBalanceInr: Math.round(balance * USDT_INR_RATE),
        depositBalanceUsdt: balance,
        depositBalanceInr: Math.round(balance * USDT_INR_RATE),
        winningsBalanceUsdt: balance,
        winningsBalanceInr: Math.round(balance * USDT_INR_RATE),
        linkedWallet: linkedWallet.wallet || null,
        depositAddress: summary.depositAddress || null,
      },
    };
  } catch (error) {
    return { success: false, error: error.message || "Wallet is unavailable" };
  }
}

export async function ensureMockDepositAddress() {
  const summary = await getWalletPaymentSummary();
  if (summary.depositAddress) return summary.depositAddress;
  const created = await createMockDepositAddress();
  return created.depositAddress;
}

export async function initiateDeposit({ amount }) {
  try {
    const amountInr = Number(amount);
    const amountUsdt = (amountInr / USDT_INR_RATE).toFixed(6);
    const result = await simulateMockDeposit(amountUsdt);
    const deposit = result.deposit;
    return { success: true, data: { transactionId: deposit.id, amountInr, amountUsdt: Number(deposit.amount_usdt), bonusCredited: 0, bonusCreditedUsdt: 0, network: "TRC-20", txHash: deposit.tx_hash, timestamp: new Date().toISOString(), status: deposit.status } };
  } catch (error) {
    return { success: false, error: error.message || "Mock deposit failed" };
  }
}

export async function initiateWithdrawal({ amount }) {
  try {
    const amountInr = Number(amount);
    const amountUsdt = (amountInr / USDT_INR_RATE).toFixed(6);
    const idempotencyKey = `wallet-ui-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
    const result = await simulateMockWithdrawal(amountUsdt, idempotencyKey);
    const withdrawal = result.withdrawal;
    return { success: true, data: { transactionId: withdrawal.id, amountInr, amountUsdt: Number(withdrawal.amount_usdt), netPayoutUsdt: Number(withdrawal.amount_usdt), networkFeeUsdt: 0, network: "TRC-20", status: withdrawal.status, estimatedArrival: "Instant mock confirmation", txHash: withdrawal.tx_hash, timestamp: new Date().toISOString() } };
  } catch (error) {
    return { success: false, error: error.message || "Mock withdrawal failed" };
  }
}

function mapTransaction(item, type) {
  const amountUsdt = Number(item.amount_usdt || 0);
  const isDeposit = type === "DEPOSITS" || type === "DEMO_PAYOUTS";
  const isDemoPayout = type === "DEMO_PAYOUTS";
  return {
    id: item.id,
    title: isDemoPayout ? `${item.title || "Contest"} · Demo payout` : isDeposit ? "USDT Mock Deposit" : "USDT Mock Withdrawal",
    category: type,
    type: isDeposit ? "CREDIT" : "DEBIT",
    status: item.status,
    amountInr: Math.round(amountUsdt * USDT_INR_RATE),
    amountUsdt,
    date: new Date(item.detected_at || item.requested_at || item.created_at || Date.now()).toLocaleString("en-IN"),
    timestamp: item.detected_at || item.requested_at || item.created_at,
    refId: item.id,
    description: isDemoPayout ? "Test-only contest payout · no blockchain transfer" : `${isDeposit ? "Demo deposit" : "Demo payout"} · TRC20`,
    paymentMethod: "USDT (TRC-20) · Demo",
    txHash: item.tx_hash,
  };
}

export async function fetchTransactionHistory({ category = "ALL" } = {}) {
  try {
    const [summary, demoWallet] = await Promise.all([getWalletPaymentSummary(), getDemoUsdtWallet().catch(() => null)]);
    const deposits = (summary.deposits || []).map((item) => mapTransaction(item, "DEPOSITS"));
    const withdrawals = (summary.withdrawals || []).map((item) => mapTransaction(item, "WITHDRAWALS"));
    const demoPayouts = (summary.demoPayouts || []).map((item) => mapTransaction(item, "DEMO_PAYOUTS"));
    const demoActivity = (demoWallet?.activity || []).map((item) => ({
      id: item.id,
      title: `${item.contest_title || 'Starting balance'} · ${item.activity_type === 'ENTRY' ? 'Entry' : item.activity_type === 'REWARD' ? 'Winning' : item.activity_type === 'REFUND' ? 'Refund' : 'Starting balance'}`,
      category: 'CONTESTS',
      type: item.activity_type === 'ENTRY' ? 'DEBIT' : 'CREDIT',
      status: 'SIMULATED',
      amountInr: null,
      amountUsdt: Number(item.amount),
      amountUsdtText: item.amount,
      date: new Date(item.created_at).toLocaleString('en-IN'),
      timestamp: item.created_at,
      refId: item.id,
      description: 'Simulated test balance · not withdrawable · no blockchain transfer',
      paymentMethod: 'USDT test balance',
      simulated: true,
    }));
    const transactions = [...demoActivity, ...demoPayouts, ...deposits, ...withdrawals].sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));
    return { success: true, warning: demoWallet ? null : 'Contest test history is unavailable.', data: category === "ALL" ? transactions : transactions.filter((item) => item.category === category) };
  } catch (error) {
    return { success: false, error: error.message || "Transaction history is unavailable" };
  }
}

export async function validateCouponCode(code, amount) {
  return { success: false, error: "Promotions are unavailable in wallet demo mode" };
}

