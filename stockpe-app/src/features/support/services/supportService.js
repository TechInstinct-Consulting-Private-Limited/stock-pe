// Support & Growth Feature Service: Referrals, FAQ & Ticket Support Data Engine
// Standardized async Promise contracts ready for backend REST/GraphQL endpoints.

export const REFERRAL_DATA = {
  referralCode: "STOCK-ARJUN",
  shareUrl: "https://stockpe.app/join/STOCK-ARJUN",
  totalReferralsCount: 18,
  activeTradersCount: 12,
  totalBonusEarnedInr: 4500,
  pendingBonusInr: 750,
  rewardPerReferralInr: 250,
  steps: [
    {
      step: 1,
      title: "Share your invite link",
      desc: "Share your unique code with friends & trading groups.",
      icon: "share-social-outline",
    },
    {
      step: 2,
      title: "Friend completes KYC & deposits",
      desc: "They get ₹100 welcome bonus on their 1st deposit.",
      icon: "wallet-outline",
    },
    {
      step: 3,
      title: "You both earn cash rewards",
      desc: "Instant ₹250 cash added to your wallet for each friend.",
      icon: "gift-outline",
    },
  ],
  friendsList: [
    {
      id: "ref-1",
      name: "Rohan Sharma",
      date: "02 Sept 2026",
      status: "COMPLETED",
      bonusInr: 250,
      avatar: "RS",
    },
    {
      id: "ref-2",
      name: "Pooja Verma",
      date: "01 Sept 2026",
      status: "COMPLETED",
      bonusInr: 250,
      avatar: "PV",
    },
    {
      id: "ref-3",
      name: "Vikram Singh",
      date: "31 Aug 2026",
      status: "PENDING_TRADE",
      bonusInr: 250,
      avatar: "VS",
    },
    {
      id: "ref-4",
      name: "Ananya Iyer",
      date: "28 Aug 2026",
      status: "COMPLETED",
      bonusInr: 250,
      avatar: "AI",
    },
  ],
};

export const FAQ_CATEGORIES = [
  { id: "ALL", label: "All Questions" },
  { id: "DEPOSITS", label: "Deposits & Payments" },
  { id: "WITHDRAWALS", label: "Withdrawals & TDS" },
  { id: "CONTESTS", label: "Contests & Fantasy" },
  { id: "KYC", label: "KYC & Verification" },
];

export const FAQ_DATA = [
  {
    id: "faq-1",
    category: "DEPOSITS",
    question: "How long do UPI and USDT deposits take to reflect?",
    answer:
      "UPI deposits (Google Pay, PhonePe, Paytm) are credited instantly within 5 seconds. USDT deposits on TRC20/BEP20 networks typically confirm after 1 network confirmation (usually 1-2 minutes).",
  },
  {
    id: "faq-2",
    category: "WITHDRAWALS",
    question: "What is the minimum withdrawal limit and processing time?",
    answer:
      "The minimum withdrawal amount is ₹100. Payouts are dispatched 24x7 via IMPS / UPI and usually arrive in your registered bank account within 15 minutes.",
  },
  {
    id: "faq-3",
    category: "WITHDRAWALS",
    question: "How is Government TDS (30%) calculated on net winnings?",
    answer:
      "As per Income Tax Section 194BA, 30% TDS is deducted only on net winnings (Total Withdrawals - Total Deposits). Principal deposits are 100% tax-exempt.",
  },
  {
    id: "faq-4",
    category: "CONTESTS",
    question: "How are fantasy points calculated for stock selections?",
    answer:
      "Points reflect live percentage price movements during market hours. Your chosen Captain earns 2x points and Vice-Captain earns 1.5x points.",
  },
  {
    id: "faq-5",
    category: "KYC",
    question: "Is PAN card mandatory for withdrawal?",
    answer:
      "Yes, PAN card verification is mandatory as per Indian financial regulations before your first withdrawal can be processed.",
  },
];

// Async API Service Handlers
export async function fetchReferralSummary() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, data: REFERRAL_DATA });
    }, 150);
  });
}

export async function fetchFaqs({ category = "ALL" } = {}) {
  return new Promise((resolve) => {
    setTimeout(() => {
      let list = FAQ_DATA;
      if (category && category !== "ALL") {
        list = FAQ_DATA.filter((item) => item.category === category);
      }
      resolve({ success: true, data: list });
    }, 150);
  });
}

export async function submitSupportTicket({ category, subject, message }) {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (!subject || !message) {
        resolve({ success: false, error: "Please provide both subject and message" });
        return;
      }
      const ticketId = `TCK-${Math.floor(100000 + Math.random() * 900000)}`;
      resolve({
        success: true,
        data: {
          ticketId,
          category,
          subject,
          status: "OPEN",
          createdDate: new Date().toISOString(),
          estimatedResponseTime: "Under 2 hours",
        },
      });
    }, 400);
  });
}
