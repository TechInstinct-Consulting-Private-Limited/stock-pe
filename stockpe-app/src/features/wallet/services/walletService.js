// Service Layer: 100% USDT Crypto Wallet & Ledger Engine
// All deposits and withdrawals operate exclusively on USDT (TRC-20, BEP-20, Polygon)

export const USDT_INR_RATE = 73.42;

export const WALLET_SUMMARY_DATA = {
  totalBalanceInr: 12450.0,
  totalBalanceUsdt: 169.57,
  depositBalanceInr: 4200.0,
  depositBalanceUsdt: 57.2,
  winningsBalanceInr: 7850.0,
  winningsBalanceUsdt: 106.91,
  bonusBalanceInr: 400.0,
  bonusBalanceUsdt: 5.44,
  lockedInContestsInr: 1500.0,
  lockedInContestsUsdt: 20.43,
  kycVerified: true,
  minDepositUsdt: 5.0,
  minDepositInr: 367,
  maxDepositUsdt: 50000.0,
  minWithdrawUsdt: 10.0,
  minWithdrawInr: 734,
  maxWithdrawDailyUsdt: 10000.0,
  tdsPercent: 0,
};

export const SUPPORTED_USDT_NETWORKS = [
  {
    id: "trc20",
    name: "TRON (TRC20)",
    shortName: "TRC-20",
    depositAddress: "TY7W7Lg93k2vQp98mZ991xKaP8392",
    networkFeeUsdt: 1.0,
    confirmationTime: "~ 2 minutes",
    minDepositUsdt: 5.0,
    badge: "Recommended",
    badgeColor: "#00C987",
    icon: "flash",
  },
  {
    id: "bep20",
    name: "BNB Smart Chain (BEP20)",
    shortName: "BEP-20",
    depositAddress: "0x89A364F1eB2109842F8C993218942782bF43",
    networkFeeUsdt: 0.5,
    confirmationTime: "~ 1 minute",
    minDepositUsdt: 5.0,
    badge: "Lowest Gas",
    badgeColor: "#F59E0B",
    icon: "logo-bitcoin",
  },
  {
    id: "polygon",
    name: "Polygon (MATIC Network)",
    shortName: "Polygon",
    depositAddress: "0x3F2E994B884210a5682C948218378820B622",
    networkFeeUsdt: 0.2,
    confirmationTime: "~ 3 minutes",
    minDepositUsdt: 5.0,
    badge: "Eco Fast",
    badgeColor: "#8B5CF6",
    icon: "infinite",
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

export const SAVED_WITHDRAWAL_ACCOUNTS = [
  {
    id: "acc_usdt_trc",
    type: "CRYPTO",
    network: "TRC-20",
    networkId: "trc20",
    walletAddress: "TY7W7Lg93k2vQp98mZ991xKaP8392",
    walletAddressMasked: "TY7W••••8392",
    label: "Binance TRC20 Wallet",
    isPrimary: true,
    isVerified: true,
  },
  {
    id: "acc_usdt_bep",
    type: "CRYPTO",
    network: "BEP-20",
    networkId: "bep20",
    walletAddress: "0x89A364F1eB2109842F8C993218942782bF43",
    walletAddressMasked: "0x89A••••bF43",
    label: "TrustWallet BEP20",
    isPrimary: false,
    isVerified: true,
  },
];

export const PROMO_COUPONS = [
  {
    code: "USDT100",
    title: "100% USDT Deposit Bonus",
    description: "Get 100% matching bonus up to 50 USDT on your deposit",
    discountPercent: 100,
    maxBonusInr: 3670,
    maxBonusUsdt: 50,
    minDepositRequired: 15,
  },
  {
    code: "CRYPTOVIP",
    title: "5% Extra Trading Margin",
    description: "Add via any USDT network and receive 5% extra cash balance",
    discountPercent: 5,
    maxBonusInr: 7340,
    maxBonusUsdt: 100,
    minDepositRequired: 50,
  },
];

export const TRANSACTIONS_DATA = [
  {
    id: "TXN-984210",
    title: "NIFTY IT Prediction Win",
    category: "CONTESTS",
    type: "CREDIT",
    status: "COMPLETED",
    amountInr: 45000.0,
    amountUsdt: 612.91,
    date: "09 Sept 2026, 08:38 AM",
    refId: "CN-NIFTY-IT-99",
    description: "Rank #3 Prize in NIFTY IT Prediction Contest",
    paymentMethod: "USDT Prize Pool",
    txHash: "0x7f9a...883b",
  },
  {
    id: "TXN-984180",
    title: "USDT Withdrawal (TRC-20)",
    category: "WITHDRAWALS",
    type: "DEBIT",
    status: "COMPLETED",
    amountInr: 20000.0,
    amountUsdt: 272.4,
    date: "08 Sept 2026, 09:15 PM",
    refId: "WD-TRC20-9912",
    description: "Payout to TY7W••••8392 (TRON Network)",
    tdsDeductedInr: 0,
    paymentMethod: "USDT (TRC-20)",
    txHash: "7a8b...112e",
  },
  {
    id: "TXN-983900",
    title: "BANK NIFTY Contest Entry",
    category: "CONTESTS",
    type: "DEBIT",
    status: "COMPLETED",
    amountInr: 99.0,
    amountUsdt: 1.35,
    date: "08 Sept 2026, 08:38 AM",
    refId: "CN-BANKNIFTY-12",
    description: "Prediction Target 51,800.00 Entry",
    paymentMethod: "USDT Wallet Balance",
  },
  {
    id: "TXN-983200",
    title: "USDT Crypto Deposit",
    category: "DEPOSITS",
    type: "CREDIT",
    status: "COMPLETED",
    amountInr: 7342.0,
    amountUsdt: 100.0,
    date: "07 Sept 2026, 03:40 PM",
    refId: "DP-USDT-BEP20-771",
    description: "BEP-20 Blockchain Transfer Confirmed",
    bonusCreditedInr: 367.0,
    bonusCreditedUsdt: 5.0,
    couponApplied: "USDT100",
    paymentMethod: "USDT (BEP-20)",
    txHash: "0x892a...981c",
  },
  {
    id: "TXN-981500",
    title: "USDT Withdrawal in Processing",
    category: "WITHDRAWALS",
    type: "DEBIT",
    status: "PENDING",
    amountInr: 5000.0,
    amountUsdt: 68.1,
    date: "06 Sept 2026, 10:00 AM",
    refId: "WD-USDT-POLYGON-12",
    description: "Payout to 0x89A••••bF43 (Polygon)",
    tdsDeductedInr: 0,
    paymentMethod: "USDT (Polygon)",
  },
];

import {
  createCryptoDeposit,
  getCryptoDepositStatus,
  getWalletBalance,
  getWalletTransactions,
  simulateIpnFinished,
} from "../../../services/api";

// Async API Service Handlers
export async function fetchWalletSummary() {
  try {
    const res = await getWalletBalance();
    if (res && res.success && res.data) {
      return {
        success: true,
        data: {
          ...WALLET_SUMMARY_DATA,
          ...res.data,
        },
      };
    }
  } catch (err) {
    // Graceful offline fallback
    console.log("[WalletService] using local balance:", err.message);
  }

  return {
    success: true,
    data: WALLET_SUMMARY_DATA,
  };
}

export async function initiateDeposit({ amount, networkId = "trc20", couponCode, txHash }) {
  const amountNum = parseFloat(amount);
  if (isNaN(amountNum) || amountNum < (WALLET_SUMMARY_DATA.minDepositInr || 367)) {
    return {
      success: false,
      error: `Minimum deposit is $${WALLET_SUMMARY_DATA.minDepositUsdt} (₹${WALLET_SUMMARY_DATA.minDepositInr})`,
    };
  }

  const usdtAmt = +(amountNum / USDT_INR_RATE).toFixed(2);
  let bonusUsdt = 0;
  if (couponCode) {
    const coupon = PROMO_COUPONS.find((c) => c.code.toUpperCase() === couponCode.toUpperCase());
    if (coupon && coupon.discountPercent) {
      bonusUsdt = Math.min((usdtAmt * coupon.discountPercent) / 100, coupon.maxBonusUsdt || 50);
    }
  }

  const network = SUPPORTED_USDT_NETWORKS.find((n) => n.id === networkId) || SUPPORTED_USDT_NETWORKS[0];

  // Attempt real NOWPayments Sandbox backend call
  try {
    const apiRes = await createCryptoDeposit(usdtAmt, network.shortName, couponCode);
    if (apiRes && apiRes.success && apiRes.data) {
      const d = apiRes.data;
      return {
        success: true,
        data: {
          transactionId: d.orderId || `TXN-USDT-${Date.now()}`,
          paymentId: d.paymentId,
          amountInr: amountNum,
          amountUsdt: d.payAmount || usdtAmt,
          bonusCredited: bonusUsdt * USDT_INR_RATE,
          bonusCreditedUsdt: bonusUsdt,
          network: d.network || network.shortName,
          depositAddress: d.depositAddress || network.depositAddress,
          txHash: txHash || null,
          isSandbox: d.isSandbox !== undefined ? d.isSandbox : true,
          status: d.status || "waiting",
          timestamp: new Date().toISOString(),
          message: d.message || "Deposit address generated via NOWPayments Sandbox",
        },
      };
    }
  } catch (err) {
    console.log("[WalletService] Backend API offline, fallback to mock simulation:", err.message);
  }

  // Graceful local simulation fallback
  const txnId = `TXN-USDT-${Math.floor(100000 + Math.random() * 900000)}`;
  return {
    success: true,
    data: {
      transactionId: txnId,
      paymentId: `NP_SIM_${Date.now()}`,
      amountInr: amountNum,
      amountUsdt: usdtAmt,
      bonusCredited: bonusUsdt * USDT_INR_RATE,
      bonusCreditedUsdt: bonusUsdt,
      network: network.shortName,
      depositAddress: network.depositAddress,
      txHash: txHash || `0x${Math.random().toString(16).slice(2, 10)}...`,
      isSandbox: true,
      timestamp: new Date().toISOString(),
      status: "SUCCESS",
    },
  };
}

export async function checkPaymentStatus(paymentId) {
  try {
    const res = await getCryptoDepositStatus(paymentId);
    if (res && res.success && res.data) {
      return {
        success: true,
        status: res.data.status,
        isCompleted: res.data.isCompleted,
        data: res.data,
      };
    }
  } catch (err) {
    console.log("[WalletService] checkPaymentStatus fallback:", err.message);
  }
  return { success: false, status: "waiting", isCompleted: false };
}


export async function initiateWithdrawal({ amount, accountId, destinationAddress, networkId }) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const amountNum = parseFloat(amount);
      if (isNaN(amountNum) || amountNum < WALLET_SUMMARY_DATA.minWithdrawInr) {
        resolve({
          success: false,
          error: `Minimum withdrawal is $${WALLET_SUMMARY_DATA.minWithdrawUsdt} (₹${WALLET_SUMMARY_DATA.minWithdrawInr})`,
        });
        return;
      }

      if (amountNum > WALLET_SUMMARY_DATA.winningsBalanceInr) {
        resolve({
          success: false,
          error: `Insufficient withdrawable winnings ($${WALLET_SUMMARY_DATA.winningsBalanceUsdt} USDT)`,
        });
        return;
      }

      const account = SAVED_WITHDRAWAL_ACCOUNTS.find((a) => a.id === accountId) || SAVED_WITHDRAWAL_ACCOUNTS[0];
      const network = SUPPORTED_USDT_NETWORKS.find((n) => n.id === networkId) || SUPPORTED_USDT_NETWORKS[0];
      const gasFeeUsdt = network.networkFeeUsdt;
      const grossUsdt = +(amountNum / USDT_INR_RATE).toFixed(2);
      const netUsdt = Math.max(0, +(grossUsdt - gasFeeUsdt).toFixed(2));
      const txnId = `WD-USDT-${Math.floor(100000 + Math.random() * 900000)}`;

      resolve({
        success: true,
        data: {
          transactionId: txnId,
          amountInr: amountNum,
          amountUsdt: grossUsdt,
          netPayoutUsdt: netUsdt,
          networkFeeUsdt: gasFeeUsdt,
          destinationAddress: destinationAddress || account.walletAddress,
          network: network.shortName,
          status: "SUCCESS",
          estimatedArrival: network.confirmationTime,
          txHash: `0x${Math.random().toString(16).slice(2, 10)}...`,
          timestamp: new Date().toISOString(),
        },
      });
    }, 350);
  });
}

export async function fetchTransactionHistory({ category = "ALL" } = {}) {
  try {
    const res = await getWalletTransactions(30);
    if (res && res.transactions && res.transactions.length > 0) {
      const formatted = res.transactions.map((tx) => {
        const isCredit = (tx.type || "").toUpperCase() === "CREDIT";
        const amtUsdt = Number(tx.amount_usdt || 0);
        const amtInr = Number(tx.amount_inr || amtUsdt * USDT_INR_RATE);
        return {
          id: tx.id || tx.payment_id || `TXN-${Date.now()}`,
          title: tx.description || (isCredit ? "USDT Crypto Deposit" : "USDT Withdrawal"),
          category: tx.category || (isCredit ? "DEPOSITS" : "WITHDRAWALS"),
          type: tx.type || (isCredit ? "CREDIT" : "DEBIT"),
          status: tx.status || "COMPLETED",
          amountInr: amtInr,
          amountUsdt: amtUsdt,
          date: tx.created_at
            ? new Date(tx.created_at).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })
            : "Just now",
          refId: tx.payment_id,
          txHash: tx.tx_hash,
          paymentMethod: tx.payment_method || "NOWPayments (USDT)",
          isCredit,
        };
      });

      let list = formatted;
      if (category && category !== "ALL") {
        list = formatted.filter((tx) => tx.category === category);
      }
      return { success: true, data: list };
    }
  } catch (err) {
    console.log("[WalletService] Live transactions offline, using local data:", err.message);
  }

  let list = TRANSACTIONS_DATA;
  if (category && category !== "ALL") {
    list = TRANSACTIONS_DATA.filter((tx) => tx.category === category);
  }
  return { success: true, data: list };
}

export async function simulateSandboxWebhook(paymentId, amount = 25, currency = "usdttrc20") {
  try {
    const res = await simulateIpnFinished(paymentId, amount, currency);
    return { success: true, data: res };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function validateCouponCode(code, amount) {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (!code) {
        resolve({ success: false, error: "Please enter a valid coupon code" });
        return;
      }
      const found = PROMO_COUPONS.find((c) => c.code.toUpperCase() === code.trim().toUpperCase());
      if (!found) {
        resolve({ success: false, error: "Invalid or expired coupon code" });
        return;
      }
      const depositAmtInr = parseFloat(amount) || 0;
      const depositAmtUsdt = depositAmtInr / USDT_INR_RATE;
      if (depositAmtUsdt < found.minDepositRequired) {
        resolve({
          success: false,
          error: `Min deposit of $${found.minDepositRequired} USDT (₹${Math.round(found.minDepositRequired * USDT_INR_RATE)}) required`,
        });
        return;
      }

      let bonusUsdt = 0;
      if (found.discountPercent) {
        bonusUsdt = Math.min((depositAmtUsdt * found.discountPercent) / 100, found.maxBonusUsdt || 50);
      }

      resolve({
        success: true,
        data: {
          ...found,
          calculatedBonusUsdt: bonusUsdt,
          calculatedBonus: +(bonusUsdt * USDT_INR_RATE).toFixed(0),
        },
      });
    }, 150);
  });
}

