const TYPE_COPY = {
  DAY_OPEN: { label: "Day Open", target: "9:15 AM IST", prediction: "opening value at 9:15 AM" },
  ONE_HOUR: { label: "10 AM", target: "10:00 AM IST", prediction: "value at 10:00 AM" },
  MIDDAY: { label: "Midday", target: "12:00 PM IST", prediction: "value at 12:00 PM" },
  CLOSING: { label: "Closing", target: "3:30 PM IST", prediction: "closing value at 3:30 PM" },
  NEXT_DAY_CLOSE: { label: "Next-day close", target: "next trading-day close", prediction: "next trading-day closing value" },
  CUSTOM: { label: "Scheduled", target: "the scheduled target time", prediction: "scheduled value" },
};

export function getContestTiming(event) {
  const contestType = String(event?.contestType || "CUSTOM").toUpperCase();
  const copy = TYPE_COPY[contestType] || TYPE_COPY.CUSTOM;
  const status = String(event?.status || "").toUpperCase();
  const entryOpen = status === "OPEN";
  const live = status === "LIVE";
  const soon = status === "SOON";

  return {
    ...copy,
    contestType,
    countdownLabel: soon ? "ENTRIES OPEN IN" : entryOpen ? "ENTRY CLOSES IN" : live ? "TARGET VALUE IN" : "RESULTS IN",
    countdownSeconds: soon
      ? Number(event?.secondsUntilOpen || 0)
      : entryOpen
        ? Number(event?.secondsUntilLive || event?.secondsUntilClose || 0)
        : Number(event?.secondsUntilClose || 0),
    countdownAt: soon ? event?.opensAt : entryOpen ? (event?.liveAt || event?.closesAt) : event?.closesAt,
  };
}
