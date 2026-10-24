// User Joined Contests Data Store
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
