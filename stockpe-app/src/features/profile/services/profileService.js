// Profile Feature Service: KYC, Predictions, Winnings, and Notifications Data Engine
// All methods return standardized async Promise<{ success: boolean, data?: any, error?: string }>

export const PROFILE_USER_DATA = {
  id: "USR-99182",
  fullName: "Arjun Kumar",
  phone: "+91-98765-43210",
  email: "arjun.kumar@example.com",
  avatarInitials: "AK",
  joinedDate: "January 2026",
  kycOverallStatus: "VERIFIED", // "VERIFIED" | "PENDING" | "UNVERIFIED"
  currentRank: 42,
  totalEventsCount: 47,
  winRatePercent: 31,
  winsCount: 14,
  totalWinningsInr: 240000,
  totalWinningsUsdt: 3268.86,
  bestAccuracyPercent: 99.99,
  streakDays: 7,
};

export const KYC_DETAILS_DATA = {
  overallStatus: "VERIFIED",
  panStatus: "VERIFIED",
  panNumberMasked: "ABCDE••••F",
  panHolderName: "ARJUN KUMAR",
  aadhaarStatus: "VERIFIED",
  aadhaarNumberMasked: "•••• •••• 9821",
  bankStatus: "VERIFIED",
  bankName: "HDFC Bank Ltd",
  bankAccountMasked: "•••• •••• 8842",
  ifscCode: "HDFC0001234",
  biometricsEnabled: true,
  twoFactorEnabled: true,
  verificationDate: "12 Feb 2026",
};

export const USER_PREDICTIONS_DATA = [
  {
    id: "pred-1",
    eventTitle: "NIFTY 50 Close Above 24,200",
    category: "INDICES",
    choice: "YES",
    quantity: 30,
    investedInr: 186,
    avgPrice: 6.2,
    currentPrice: 8.5,
    currentValueInr: 255,
    pnlInr: +69,
    pnlPercent: "+37.1%",
    isProfit: true,
    status: "LIVE",
    timeRemaining: "01h 15m",
  },
  {
    id: "pred-2",
    eventTitle: "SENSEX To Cross 79,500 by Thursday",
    category: "INDICES",
    choice: "NO",
    quantity: 50,
    investedInr: 190,
    avgPrice: 3.8,
    currentPrice: 4.6,
    currentValueInr: 230,
    pnlInr: +40,
    pnlPercent: "+21.05%",
    isProfit: true,
    status: "LIVE",
    timeRemaining: "03h 40m",
  },
  {
    id: "pred-3",
    eventTitle: "FINNIFTY Weekly Expiry Target > 23,700",
    category: "INDICES",
    choice: "TARGET 23,750",
    quantity: 100,
    investedInr: 550,
    avgPrice: 5.5,
    settledPrice: 10.0,
    payoutInr: 1000,
    pnlInr: +450,
    pnlPercent: "+81.8%",
    isProfit: true,
    status: "WON",
    settledDate: "01 Sept 2026",
  },
  {
    id: "pred-4",
    eventTitle: "NIFTY IT Index To Touch 41,500 Before Expiry",
    category: "INDICES",
    choice: "YES",
    quantity: 40,
    investedInr: 280,
    avgPrice: 7.0,
    settledPrice: 0.0,
    payoutInr: 0,
    pnlInr: -280,
    pnlPercent: "-100%",
    isProfit: false,
    status: "LOST",
    settledDate: "30 Aug 2026",
  },
];

export const USER_WINNINGS_DATA = {
  totalWinningsInr: 240000,
  totalWinningsUsdt: 3268.86,
  breakdown: {
    fantasyContestsInr: 185000,
    eventTradingInr: 45000,
    leaderboardRewardsInr: 8000,
    referralBonusesInr: 2000,
  },
  tdsSummary: {
    grossWinningsInr: 240000,
    tdsDeductedInr: 0,
    netWithdrawableInr: 240000,
    financialYear: "2026-2027",
  },
  topWins: [
    {
      id: "win-1",
      title: "1st Rank - NIFTY IT Fantasy League",
      prizeInr: 45000,
      prizeUsdt: 612.24,
      date: "31 Aug 2026",
      badge: "Rank 1 🥇",
    },
    {
      id: "win-2",
      title: "2nd Rank - Bank Nifty Mega Arena",
      prizeInr: 25000,
      prizeUsdt: 340.5,
      date: "25 Aug 2026",
      badge: "Rank 2 🥈",
    },
    {
      id: "win-3",
      title: "BSE SENSEX 79,500 Target Market",
      prizeInr: 12500,
      prizeUsdt: 170.25,
      date: "20 Aug 2026",
      badge: "Market Win 📈",
    },
  ],
};

export const NOTIFICATIONS_DATA = [
  {
    id: "notif-1",
    title: "🎉 Congratulations! You Won ₹45,000",
    message: "Your team 'Index Titans' ranked #1 in NIFTY IT Mega Contest.",
    category: "WINNINGS",
    time: "2 hours ago",
    read: false,
    icon: "trophy",
    iconColor: "#F59E0B",
    iconBg: "#FEF3C7",
  },
  {
    id: "notif-2",
    title: "✅ USDT Deposit Confirmed",
    message: "100 USDT credited to your crypto wallet on TRC-20.",
    category: "WALLET",
    time: "5 hours ago",
    read: false,
    icon: "arrow-down-circle",
    iconColor: "#00C987",
    iconBg: "#E6FBF3",
  },
  {
    id: "notif-3",
    title: "⚡ Market Alert: NIFTY 50 Crossed 24,200",
    message: "Your Target Prediction is now in 37.1% profit.",
    category: "TRADING",
    time: "Yesterday",
    read: true,
    icon: "trending-up",
    iconColor: "#6366F1",
    iconBg: "#EEF2FF",
  },
  {
    id: "notif-4",
    title: "🛡️ KYC Documents Successfully Verified",
    message: "Your PAN and on-chain USDT destination are 100% verified.",
    category: "KYC",
    time: "2 days ago",
    read: true,
    icon: "shield-checkmark",
    iconColor: "#00C987",
    iconBg: "#E6FBF3",
  },
];

// Async Service Handlers
export async function fetchProfileData() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, data: PROFILE_USER_DATA });
    }, 150);
  });
}

export async function fetchKycDetails() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, data: KYC_DETAILS_DATA });
    }, 150);
  });
}

export async function submitPanVerification({ panNumber, fullName, dob }) {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (!panNumber || panNumber.length !== 10) {
        resolve({ success: false, error: "Please enter a valid 10-digit PAN number" });
        return;
      }
      resolve({
        success: true,
        data: {
          status: "VERIFIED",
          panNumberMasked: `${panNumber.substring(0, 5)}••••${panNumber.substring(9)}`,
          fullName: fullName.toUpperCase(),
        },
      });
    }, 400);
  });
}

export async function submitAadhaarOtp({ aadhaarNumber, otp }) {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (!otp || otp.length !== 6) {
        resolve({ success: false, error: "Please enter valid 6-digit Aadhaar OTP" });
        return;
      }
      resolve({
        success: true,
        data: {
          status: "VERIFIED",
          aadhaarMasked: "•••• •••• " + (aadhaarNumber ? aadhaarNumber.slice(-4) : "9821"),
        },
      });
    }, 400);
  });
}

export async function fetchUserPredictions({ filter = "ALL" } = {}) {
  return new Promise((resolve) => {
    setTimeout(() => {
      let list = USER_PREDICTIONS_DATA;
      if (filter === "LIVE") list = USER_PREDICTIONS_DATA.filter((p) => p.status === "LIVE");
      else if (filter === "SETTLED") list = USER_PREDICTIONS_DATA.filter((p) => p.status !== "LIVE");
      resolve({ success: true, data: list });
    }, 150);
  });
}

export async function fetchUserWinnings() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, data: USER_WINNINGS_DATA });
    }, 150);
  });
}

export async function fetchNotifications() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, data: NOTIFICATIONS_DATA });
    }, 150);
  });
}
