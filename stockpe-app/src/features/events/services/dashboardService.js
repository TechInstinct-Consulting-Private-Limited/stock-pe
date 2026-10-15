import { getDemoContest, getDemoDashboard } from "../../../services/api";

export const DASHBOARD_TABS = [
  { id: "ALL", label: "ALL" },
  { id: "LIVE", label: "• LIVE" },
  { id: "OPEN", label: "OPEN" },
  { id: "SOON", label: "SOON" },
];

function formatCredits(value) {
  return `${Number(value || 0).toLocaleString("en-IN")} Credits`;
}

export function formatCountdown(seconds) {
  const safeSeconds = Math.max(0, Math.floor(Number(seconds) || 0));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const remainingSeconds = safeSeconds % 60;

  return [hours, minutes, remainingSeconds]
    .map((part) => String(part).padStart(2, "0"))
    .join(":");
}

export function toFeedCard(contest, now = Date.now()) {
  const opensAt = new Date(contest.opensAt).getTime();
  const closesAt = new Date(contest.closesAt).getTime();
  const isSoon = contest.status === "SOON";
  const targetTime = isSoon ? opensAt : closesAt;
  const fallbackSeconds = isSoon
    ? contest.secondsUntilOpen
    : contest.secondsUntilClose;
  const countdown = Number.isFinite(targetTime)
    ? formatCountdown((targetTime - now) / 1000)
    : formatCountdown(fallbackSeconds);
  const timeLabel = isSoon
    ? "OPENS IN"
    : contest.status === "LIVE"
      ? "CONTEST ENDS IN"
      : "ENTRY CLOSES IN";

  return {
    id: contest.id,
    title: contest.title,
    question: contest.question,
    status: contest.status,
    currentPrice: Number(contest.currentPrice).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }),
    change: `${Number(contest.changePercent).toFixed(2)}%`,
    isPositive: contest.isPositive,
    prizePool: formatCredits(contest.prizePoolCredits),
    prizePoolLabel: "DEMO POOL",
    entry: formatCredits(contest.entryCredits),
    entryLabel: "DEMO ENTRY",
    entrySubLabel: "Non-withdrawable credits",
    players: contest.players,
    closesIn: countdown,
    timeLabel,
    fillPercent: contest.fillPercent,
    fillColor:
      contest.status === "LIVE"
        ? "#EF4444"
        : contest.status === "SOON"
          ? "#F59E0B"
          : "#00C987",
    isDemo: contest.isDemo,
  };
}

export async function fetchDashboard(status) {
  return getDemoDashboard(status);
}

export function toDetailEvent(contest) {
  const currentPrice = Number(contest.currentPrice || 0);
  const changePercent = Number(contest.changePercent || 0);

  return {
    id: contest.id,
    title: contest.title,
    question: contest.question,
    description: contest.question,
    status: contest.status,
    currentPrice: currentPrice.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }),
    spotNumeric: currentPrice,
    change: `${changePercent >= 0 ? "+" : ""}${changePercent.toFixed(2)}%`,
    isPositive: contest.isPositive,
    entryCredits: Number(contest.entryCredits),
    prizePoolCredits: Number(contest.prizePoolCredits),
    players: Number(contest.players),
    playerCapacity: Number(contest.playerCapacity),
    fillPercent: Number(contest.fillPercent),
    opensAt: contest.opensAt,
    liveAt: contest.liveAt,
    secondsUntilLive: Number(contest.secondsUntilLive),
    closesAt: contest.closesAt,
    secondsUntilClose: Number(contest.secondsUntilClose),
    settlementSource: contest.settlementSource,
    instrument: contest.instrument,
    isDemo: true,
  };
}

export async function fetchDashboardContest(publicId) {
  const response = await getDemoContest(publicId);
  return toDetailEvent(response.contest);
}
