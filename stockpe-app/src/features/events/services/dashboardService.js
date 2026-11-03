import { getDemoContest, getDemoDashboard } from "../../../services/api";

export const DASHBOARD_TABS = [
  { id: "ALL", label: "ALL" },
  { id: "LIVE", label: "• LIVE" },
  { id: "OPEN", label: "OPEN" },
  { id: "SOON", label: "SOON" },
];

const IST_TIME_ZONE = "Asia/Kolkata";
const CONTEST_TYPE_ORDER = {
  DAY_OPEN: 1,
  ONE_HOUR: 2,
  MIDDAY: 3,
  CLOSING: 4,
  NEXT_DAY_CLOSE: 5,
  CUSTOM: 99,
};

function formatCredits(value) {
  return `${Number(value || 0).toLocaleString("en-IN")} Credits`;
}

function getFeedCountdownLabel(status) {
  if (status === "SOON") return "ENTRIES OPEN IN";
  if (status === "OPEN") return "ENTRY CLOSES IN";
  if (status === "LIVE") return "TARGET VALUE IN";
  return "RESULTS IN";
}

function getContestTypeLabel(contestType) {
  return ({ DAY_OPEN: "DAY OPEN", ONE_HOUR: "10 AM", MIDDAY: "MIDDAY", CLOSING: "CLOSING", NEXT_DAY_CLOSE: "NEXT-DAY" })[contestType] || "SCHEDULED";
}

function toIstDateKey(value) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "";
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: IST_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function formatIstDateTime(value, options) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "Scheduled time";
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: IST_TIME_ZONE,
    ...options,
  }).format(date);
}

function getCardState(status, opensAt, liveAt, closesAt) {
  const state = String(status || "").toUpperCase();
  if (state === "SOON") {
    return {
      stateLabel: "OPENS SOON",
      scheduleLabel: `Target: ${formatIstDateTime(closesAt, { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}`,
      stateDetail: `Entries open ${formatIstDateTime(opensAt, { weekday: "short", hour: "numeric", minute: "2-digit" })}`,
    };
  }
  if (state === "OPEN") {
    return {
      stateLabel: "ENTRIES OPEN",
      scheduleLabel: `Target: ${formatIstDateTime(closesAt, { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}`,
      stateDetail: `Prediction locks ${formatIstDateTime(liveAt || closesAt, { hour: "numeric", minute: "2-digit" })}`,
    };
  }
  if (state === "LIVE") {
    return {
      stateLabel: "PREDICTIONS LOCKED",
      scheduleLabel: `Target: ${formatIstDateTime(closesAt, { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}`,
      stateDetail: "Market target is being tracked",
    };
  }
  return {
    stateLabel: "RESULT PENDING",
    scheduleLabel: `Target: ${formatIstDateTime(closesAt, { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}`,
    stateDetail: "Result will appear after settlement",
  };
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
  const isOpen = contest.status === "OPEN";
  const liveAt = contest.liveAt ? new Date(contest.liveAt).getTime() : NaN;
  const targetTime = isSoon ? opensAt : isOpen && Number.isFinite(liveAt) ? liveAt : closesAt;
  const fallbackSeconds = isSoon
    ? contest.secondsUntilOpen
    : isOpen && contest.liveAt ? contest.secondsUntilLive : contest.secondsUntilClose;
  const countdown = Number.isFinite(targetTime)
    ? formatCountdown((targetTime - now) / 1000)
    : formatCountdown(fallbackSeconds);
  const timeLabel = getFeedCountdownLabel(contest.status);
  const contestType = contest.contestType || "CUSTOM";
  const presentation = getCardState(contest.status, contest.opensAt, contest.liveAt, contest.closesAt);

  return {
    id: contest.id,
    title: contest.title,
    question: contest.question,
    status: contest.status,
    contestType,
    contestTypeLabel: getContestTypeLabel(contestType),
    targetAt: contest.closesAt,
    targetDateKey: toIstDateKey(contest.closesAt),
    typeOrder: CONTEST_TYPE_ORDER[contestType] || CONTEST_TYPE_ORDER.CUSTOM,
    ...presentation,
    currentPrice: Number(contest.currentPrice).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }),
    change: `${Number(contest.changePercent).toFixed(2)}%`,
    isPositive: contest.isPositive,
    prizePool: contest.currency === 'DEMO_USDT' ? `${contest.prizePoolCredits} USDT` : formatCredits(contest.prizePoolCredits),
    prizePoolLabel: "DEMO POOL",
    entry: contest.currency === 'DEMO_USDT' ? `${contest.entryCredits} USDT` : formatCredits(contest.entryCredits),
    entryLabel: "DEMO ENTRY",
    entrySubLabel: contest.currency === 'DEMO_USDT' ? "Simulated · non-withdrawable" : "Non-withdrawable credits",
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

export function groupFeedCards(cards, now = Date.now()) {
  const todayKey = toIstDateKey(now);
  const groups = { today: [], upcoming: [] };

  cards.forEach((card) => {
    if (card.targetDateKey === todayKey) groups.today.push(card);
    else groups.upcoming.push(card);
  });

  const byJourney = (left, right) => {
    if (left.targetDateKey !== right.targetDateKey) return left.targetDateKey.localeCompare(right.targetDateKey);
    if (left.typeOrder !== right.typeOrder) return left.typeOrder - right.typeOrder;
    return new Date(left.targetAt).getTime() - new Date(right.targetAt).getTime();
  };

  groups.today.sort(byJourney);
  groups.upcoming.sort(byJourney);

  return [
    { id: "today", title: "TODAY'S PREDICTIONS", subtitle: formatIstDateTime(now, { weekday: "long", day: "numeric", month: "short" }), cards: groups.today },
    { id: "upcoming", title: "UPCOMING PREDICTIONS", subtitle: "Plan your next market prediction", cards: groups.upcoming },
  ].filter((group) => group.cards.length > 0);
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
    contestType: contest.contestType || "CUSTOM",
    currency: contest.currency,
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
    secondsUntilOpen: Number(contest.secondsUntilOpen),
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
