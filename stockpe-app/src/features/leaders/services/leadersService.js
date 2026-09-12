// Leaders Feature Service: Competitor Profiles, Historical Win Records & Head-to-Head Analytics
// Standardized async Promise contracts ready for backend REST/GraphQL endpoints.

export const PLAYERS_DATA = {
  "1": {
    id: "1",
    name: "Arjun Mehta",
    initials: "AM",
    avatarBg: "#DCFCE7",
    avatarColor: "#059669",
    rank: 1,
    tier: "DIAMOND TRADER 💎",
    joinedDate: "December 2025",
    verified: true,
    totalWinningsInr: 400000,
    totalWinningsUsdt: 5448.11,
    winRatePercent: 78,
    contestsPlayed: 142,
    contestsWon: 111,
    bestAccuracy: "99.99%",
    activeStreak: 9,
    trophies: [
      { id: "t1", title: "Championship 1st", icon: "trophy", color: "#F59E0B", bg: "#FEF3C7" },
      { id: "t2", title: "9-Day Streak", icon: "flame", color: "#EF4444", bg: "#FEE2E2" },
      { id: "t3", title: "NIFTY Sniper", icon: "locate", color: "#6366F1", bg: "#EEF2FF" },
      { id: "t4", title: "Diamond Tier", icon: "diamond", color: "#00C987", bg: "#E6FBF3" },
    ],
    pastPicks: [
      {
        id: "pick-1",
        contestName: "NIFTY IT Mega League",
        date: "Yesterday",
        rank: "1st",
        points: "492.5 pts",
        prizeInr: "₹45,000",
        captain: "NIFTY IT (+4.2%)",
        viceCaptain: "BANK NIFTY (+3.1%)",
        status: "WON",
      },
      {
        id: "pick-2",
        contestName: "Bank Nifty High Volatility",
        date: "01 Sept 2026",
        rank: "2nd",
        points: "448.0 pts",
        prizeInr: "₹20,000",
        captain: "BANK NIFTY (+2.8%)",
        viceCaptain: "FINNIFTY (+2.4%)",
        status: "WON",
      },
      {
        id: "pick-3",
        contestName: "Auto & FMCG Surge",
        date: "30 Aug 2026",
        rank: "1st",
        points: "510.2 pts",
        prizeInr: "₹35,000",
        captain: "NIFTY AUTO (+5.1%)",
        viceCaptain: "NIFTY FMCG (+3.8%)",
        status: "WON",
      },
    ],
  },
  "2": {
    id: "2",
    name: "Priya Sharma",
    initials: "PS",
    avatarBg: "#E0F2FE",
    avatarColor: "#0284C7",
    rank: 2,
    tier: "PLATINUM TRADER 🏆",
    joinedDate: "January 2026",
    verified: true,
    totalWinningsInr: 200000,
    totalWinningsUsdt: 2724.05,
    winRatePercent: 72,
    contestsPlayed: 118,
    contestsWon: 85,
    bestAccuracy: "99.98%",
    activeStreak: 5,
    trophies: [
      { id: "t1", title: "2nd Rank Hero", icon: "medal", color: "#64748B", bg: "#F1F5F9" },
      { id: "t2", title: "5-Day Streak", icon: "flame", color: "#EF4444", bg: "#FEE2E2" },
      { id: "t3", title: "Sensex Specialist", icon: "trending-up", color: "#00C987", bg: "#E6FBF3" },
    ],
    pastPicks: [
      {
        id: "pick-1",
        contestName: "SENSEX Bulls Rally",
        date: "Yesterday",
        rank: "2nd",
        points: "462.0 pts",
        prizeInr: "₹25,000",
        captain: "SENSEX (+3.4%)",
        viceCaptain: "NIFTY INFRA (+2.9%)",
        status: "WON",
      },
    ],
  },
  "3": {
    id: "3",
    name: "Rohan Gupta",
    initials: "RG",
    avatarBg: "#E0E7FF",
    avatarColor: "#4F46E5",
    rank: 3,
    tier: "PLATINUM TRADER 🏆",
    joinedDate: "January 2026",
    verified: true,
    totalWinningsInr: 150000,
    totalWinningsUsdt: 2043.04,
    winRatePercent: 69,
    contestsPlayed: 94,
    contestsWon: 65,
    bestAccuracy: "99.98%",
    activeStreak: 4,
    trophies: [
      { id: "t1", title: "Podium Finisher", icon: "trophy", color: "#EA580C", bg: "#FFF7ED" },
      { id: "t2", title: "Midcap Master", icon: "bulb", color: "#F59E0B", bg: "#FEF3C7" },
    ],
    pastPicks: [
      {
        id: "pick-1",
        contestName: "Midcap Select Surge",
        date: "Yesterday",
        rank: "3rd",
        points: "438.5 pts",
        prizeInr: "₹15,000",
        captain: "MIDCP NIFTY (+4.8%)",
        viceCaptain: "NIFTY PHARMA (+3.2%)",
        status: "WON",
      },
    ],
  },
};

// Fallback generator for other player IDs
export function getPlayerById(playerId) {
  if (PLAYERS_DATA[playerId]) {
    return PLAYERS_DATA[playerId];
  }
  return {
    id: String(playerId),
    name: `Trader #${playerId}`,
    initials: `T${playerId}`,
    avatarBg: "#F1F5F9",
    avatarColor: "#475569",
    rank: Number(playerId) || 4,
    tier: "GOLD TRADER 🥇",
    joinedDate: "February 2026",
    verified: true,
    totalWinningsInr: 75000,
    totalWinningsUsdt: 1021.5,
    winRatePercent: 61,
    contestsPlayed: 56,
    contestsWon: 34,
    bestAccuracy: "99.94%",
    activeStreak: 3,
    trophies: [
      { id: "t1", title: "Top 10 Master", icon: "medal", color: "#F59E0B", bg: "#FEF3C7" },
      { id: "t2", title: "Streak Runner", icon: "flame", color: "#EF4444", bg: "#FEE2E2" },
    ],
    pastPicks: [
      {
        id: "pick-1",
        contestName: "NIFTY Daily League",
        date: "Yesterday",
        rank: "Top 10",
        points: "412.0 pts",
        prizeInr: "₹5,000",
        captain: "NIFTY 50 (+2.5%)",
        viceCaptain: "BANK NIFTY (+1.9%)",
        status: "WON",
      },
    ],
  };
}

// Async API Service Handler
export async function fetchPlayerProfile(playerId) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        data: getPlayerById(playerId),
      });
    }, 150);
  });
}
