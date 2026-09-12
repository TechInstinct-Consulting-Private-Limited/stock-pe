// Contests & Fantasy Index Trading Data Engine
export const CONTEST_CATEGORIES = [
  { id: "all", label: "All Leagues", icon: "flash" },
  { id: "mega", label: "Mega Pools", icon: "trophy" },
  { id: "hourly", label: "Hourly Sprint", icon: "time" },
  { id: "head2head", label: "1v1 Battles", icon: "people" },
  { id: "free", label: "Practice / Free", icon: "gift" },
];

export const INDEX_CATALOG = [
  {
    symbol: "NIFTY 50",
    name: "Nifty 50 Benchmark Index",
    sector: "Benchmark",
    price: "24,187.65",
    change: "+0.84%",
    isPositive: true,
    credits: 10.0,
    selectedCount: "92%",
  },
  {
    symbol: "BANK NIFTY",
    name: "Nifty Banking Sector Index",
    sector: "Banking",
    price: "51,843.25",
    change: "+1.12%",
    isPositive: true,
    credits: 9.5,
    selectedCount: "88%",
  },
  {
    symbol: "SENSEX",
    name: "BSE SENSEX 30 Index",
    sector: "Benchmark",
    price: "79,432.18",
    change: "-0.31%",
    isPositive: false,
    credits: 9.5,
    selectedCount: "82%",
  },
  {
    symbol: "FINNIFTY",
    name: "Nifty Financial Services",
    sector: "Finance",
    price: "23,650.40",
    change: "+0.62%",
    isPositive: true,
    credits: 9.0,
    selectedCount: "74%",
  },
  {
    symbol: "NIFTY IT",
    name: "Nifty Information Tech",
    sector: "IT",
    price: "41,250.80",
    change: "+1.35%",
    isPositive: true,
    credits: 9.0,
    selectedCount: "78%",
  },
  {
    symbol: "NIFTY AUTO",
    name: "Nifty Automobiles Index",
    sector: "Auto",
    price: "22,940.30",
    change: "+2.10%",
    isPositive: true,
    credits: 8.5,
    selectedCount: "69%",
  },
  {
    symbol: "NIFTY PHARMA",
    name: "Nifty Pharmaceuticals Index",
    sector: "Pharma",
    price: "21,680.15",
    change: "-0.40%",
    isPositive: false,
    credits: 8.5,
    selectedCount: "58%",
  },
  {
    symbol: "NIFTY FMCG",
    name: "Nifty Fast Moving Consumer Goods",
    sector: "FMCG",
    price: "58,240.00",
    change: "+0.45%",
    isPositive: true,
    credits: 8.5,
    selectedCount: "51%",
  },
  {
    symbol: "NIFTY METAL",
    name: "Nifty Metals & Mining Index",
    sector: "Metals",
    price: "9,120.40",
    change: "+1.85%",
    isPositive: true,
    credits: 8.0,
    selectedCount: "63%",
  },
  {
    symbol: "NIFTY ENERGY",
    name: "Nifty Energy & Oil Index",
    sector: "Energy",
    price: "39,450.00",
    change: "-0.75%",
    isPositive: false,
    credits: 8.5,
    selectedCount: "48%",
  },
  {
    symbol: "NIFTY INFRA",
    name: "Nifty Infrastructure Index",
    sector: "Infra",
    price: "8,940.20",
    change: "+0.95%",
    isPositive: true,
    credits: 8.0,
    selectedCount: "54%",
  },
  {
    symbol: "MIDCP NIFTY",
    name: "Nifty Midcap Select Index",
    sector: "Midcap",
    price: "12,980.15",
    change: "+0.95%",
    isPositive: true,
    credits: 8.5,
    selectedCount: "60%",
  },
];

export const STOCK_CATALOG = INDEX_CATALOG;

export const CONTESTS_DATA = [
  {
    id: "nifty-mega-pool",
    title: "NIFTY 50 MEGA ARENA",
    subtitle: "Daily Grand Tournament",
    category: "mega",
    status: "OPEN",
    statusColor: "#00C987",
    statusBg: "#E6FBF3",
    prizePoolInr: "₹5,00,000",
    prizePoolUsdt: "68,101.40",
    firstPrizeInr: "₹1,00,000",
    firstPrizeUsdt: "13,620.27",
    entryFeeInr: "₹49",
    entryFeeUsdt: "0.67 USDT",
    totalSpots: 15000,
    filledSpots: 11420,
    fillPercent: 76,
    winnersPercent: "60%",
    maxTeams: 6,
    closesIn: "01h 45m 20s",
    startTime: "Today, 09:15 AM",
    endTime: "Today, 03:30 PM",
    topHighlight: "#00C987",
    prizeMatrix: [
      { rank: "Rank 1", amount: "₹1,00,000", usdt: "1,362 USDT" },
      { rank: "Rank 2", amount: "₹50,000", usdt: "681 USDT" },
      { rank: "Rank 3", amount: "₹25,000", usdt: "340 USDT" },
      { rank: "Rank 4 - 10", amount: "₹5,000", usdt: "68 USDT" },
      { rank: "Rank 11 - 50", amount: "₹1,000", usdt: "13.6 USDT" },
      { rank: "Rank 51 - 500", amount: "₹200", usdt: "2.7 USDT" },
      { rank: "Rank 501 - 9000", amount: "₹75", usdt: "1.0 USDT" },
    ],
    rules: [
      "Select exactly 6 index benchmarks within the 100-credit budget.",
      "Assign LONG (Bullish) or SHORT (Bearish) tag to every index.",
      "LONG indices gain +1 pt per +0.1% gain and lose -1 pt per -0.1% drop.",
      "SHORT indices gain +1 pt per -0.1% drop and lose -1 pt per +0.1% rise.",
      "Designate 1 Captain (2x multiplier) and 1 Vice-Captain (1.5x multiplier).",
      "Live tournament rank updates in real-time during market hours (09:15 - 15:30 IST).",
    ],
  },
  {
    id: "bank-nifty-sprint",
    title: "BANK NIFTY POWER HOUR",
    subtitle: "Hourly Afternoon Sprint",
    category: "hourly",
    status: "• LIVE",
    statusColor: "#EF4444",
    statusBg: "#FEE2E2",
    prizePoolInr: "₹1,50,000",
    prizePoolUsdt: "20,430.40",
    firstPrizeInr: "₹35,000",
    firstPrizeUsdt: "4,767.10",
    entryFeeInr: "₹29",
    entryFeeUsdt: "0.39 USDT",
    totalSpots: 6000,
    filledSpots: 5280,
    fillPercent: 88,
    winnersPercent: "50%",
    maxTeams: 3,
    closesIn: "00h 28m 10s",
    startTime: "Today, 01:30 PM",
    endTime: "Today, 02:30 PM",
    topHighlight: "#EF4444",
    prizeMatrix: [
      { rank: "Rank 1", amount: "₹35,000", usdt: "476 USDT" },
      { rank: "Rank 2", amount: "₹15,000", usdt: "204 USDT" },
      { rank: "Rank 3", amount: "₹8,000", usdt: "108 USDT" },
      { rank: "Rank 4 - 20", amount: "₹1,500", usdt: "20 USDT" },
      { rank: "Rank 21 - 3000", amount: "₹50", usdt: "0.68 USDT" },
    ],
    rules: [
      "Hourly volatility sprint. Pick 6 indices.",
      "Scoring locks at 02:30 PM IST sharp.",
    ],
  },
  {
    id: "tech-titans-1v1",
    title: "INDEX TITANS 1v1 BATTLE",
    subtitle: "Winner Takes All Duel",
    category: "head2head",
    status: "OPEN",
    statusColor: "#38BDF8",
    statusBg: "#E0F2FE",
    prizePoolInr: "₹10,000",
    prizePoolUsdt: "1,362.00",
    firstPrizeInr: "₹10,000",
    firstPrizeUsdt: "1,362.00",
    entryFeeInr: "₹5,250",
    entryFeeUsdt: "71.50 USDT",
    totalSpots: 2,
    filledSpots: 1,
    fillPercent: 50,
    winnersPercent: "50%",
    maxTeams: 1,
    closesIn: "03h 10m 00s",
    startTime: "Today, 09:15 AM",
    endTime: "Today, 03:30 PM",
    prizeMatrix: [
      { rank: "Rank 1 (Winner)", amount: "₹10,000", usdt: "1,362 USDT" },
    ],
    rules: [
      "High stakes 1v1 head-to-head index duel.",
      "Participant with highest team points takes full prize pool.",
    ],
  },
  {
    id: "rookie-free-league",
    title: "ROOKIE PRACTICE ARENA",
    subtitle: "Zero Risk • Real Cash",
    category: "free",
    status: "OPEN",
    statusColor: "#00C987",
    statusBg: "#E6FBF3",
    prizePoolInr: "₹5,00,000",
    prizePoolUsdt: "68.10",
    firstPrizeInr: "₹1,000",
    firstPrizeUsdt: "13.62",
    entryFeeInr: "FREE",
    entryFeeUsdt: "0.00 USDT",
    totalSpots: 5000,
    filledSpots: 4310,
    fillPercent: 86,
    winnersPercent: "40%",
    maxTeams: 1,
    closesIn: "05h 30m 00s",
    startTime: "Today, 09:15 AM",
    endTime: "Today, 03:30 PM",
    prizeMatrix: [
      { rank: "Rank 1", amount: "₹1,000", usdt: "13.6 USDT" },
      { rank: "Rank 2", amount: "₹500", usdt: "6.8 USDT" },
      { rank: "Rank 3 - 50", amount: "₹50", usdt: "0.68 USDT" },
    ],
    rules: [
      "100% Free to enter.",
      "Perfect for practicing index portfolio strategies.",
    ],
  },
];

// Mock User Joined Prediction Contests Store matching wireframe
let joinedContests = [
  {
    joinId: "JOIN-9021",
    contestId: "nifty-it-contest",
    indexSymbol: "NIFTY IT",
    contestTitle: "NIFTY IT",
    status: "WON",
    timestamp: "09 Sept, 08:38 am",
    prizeInr: "₹45K",
    prizeUsdt: "612.91",
    prediction: "38,750.00",
    entryFeeInr: "₹149",
    entryFeeUsdt: "2.03 USDT",
    accuracy: 99.97,
    rank: 3,
    pnl: "+₹45,000",
    isProfitable: true,
  },
  {
    joinId: "JOIN-9022",
    contestId: "bank-nifty-contest",
    indexSymbol: "BANK NIFTY",
    contestTitle: "BANK NIFTY",
    status: "LOST",
    timestamp: "08 Sept, 08:38 am",
    prizeInr: null,
    prizeUsdt: null,
    prediction: "51,800.00",
    entryFeeInr: "₹99",
    entryFeeUsdt: "1.35 USDT",
    accuracy: 98.50,
    rank: null,
    pnl: "-₹99",
    isProfitable: false,
  },
];

export function fetchContestById(id) {
  return CONTESTS_DATA.find((c) => c.id === id) || CONTESTS_DATA[0];
}

export function fetchAllContests(categoryId = "all") {
  if (categoryId === "all") return CONTESTS_DATA;
  return CONTESTS_DATA.filter((c) => c.category === categoryId);
}

export function fetchStockCatalog(sector = "all") {
  if (sector === "all") return STOCK_CATALOG;
  return STOCK_CATALOG.filter((s) => s.sector.toLowerCase() === sector.toLowerCase());
}

export function fetchJoinedContests() {
  return [...joinedContests];
}

export function fetchContestSummary() {
  const totalJoined = joinedContests.length;
  const active = joinedContests.filter((i) => i.status === "LIVE" || i.status === "ACTIVE").length;
  const won = joinedContests.filter((i) => i.status.includes("WON")).length;
  const lost = joinedContests.filter((i) => i.status === "LOST").length;

  return {
    totalJoined,
    active,
    won,
    lost,
    totalSpent: "₹248",
    totalWon: "₹45,000",
    netPnl: "+₹44,752",
  };
}

export function joinContestWithTeam({ contestId, teamName, selectedStocks, captain, viceCaptain }) {
  const contest = fetchContestById(contestId);
  const newEntry = {
    joinId: `JOIN-${Math.floor(1000 + Math.random() * 9000)}`,
    contestId,
    indexSymbol: contest.title || "NIFTY 50",
    contestTitle: contest.title,
    entryFeeInr: contest.entryFeeInr,
    entryFeeUsdt: contest.entryFeeUsdt,
    teamName: teamName || "My Squad",
    rank: Math.floor(10 + Math.random() * 80),
    accuracy: 99.12,
    prediction: "24,850.00",
    prizeInr: null,
    prizeUsdt: null,
    pnl: "Pending",
    isProfitable: true,
    status: "LIVE",
    timestamp: "Just now",
  };

  joinedContests = [newEntry, ...joinedContests];
  return newEntry;
}

