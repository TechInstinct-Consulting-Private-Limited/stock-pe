import {
  getOnboardingStatus,
  getProfileMe,
  getProfileNotifications,
  getProfilePredictions,
  getProfileWinnings,
  getNotificationPreferences,
  markAllProfileNotificationsRead,
  markProfileNotificationRead,
  updateNotificationPreferences,
} from "../../../services/api";

const result = async (work) => {
  try {
    return { success: true, data: await work() };
  } catch (error) {
    return { success: false, error: error?.message || "Unable to load profile data." };
  }
};

const dateLabel = (value) => value ? new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const mapPrediction = (entry) => ({
  id: entry.id,
  eventTitle: entry.title,
  category: "DEMO CONTEST",
  status: entry.status === "ACTIVE" ? "ACTIVE" : entry.status,
  predictionValue: entry.prediction_value,
  entryCredits: Number(entry.entry_credits || 0),
  rewardCredits: Number(entry.reward_credits || 0),
  settlementValue: entry.settlement_value,
  joinedAt: dateLabel(entry.joined_at),
  settledAt: dateLabel(entry.settled_at),
});

const notificationPresentation = {
  CONTEST_CREATED: { icon: "calendar", iconColor: "#2563EB", iconBg: "#DBEAFE" },
  CONTEST_OPEN: { icon: "play-circle", iconColor: "#059669", iconBg: "#D1FAE5" },
  CONTEST_LIVE: { icon: "radio", iconColor: "#E11D48", iconBg: "#FFE4E6" },
  CONTEST_CLOSED: { icon: "lock-closed", iconColor: "#64748B", iconBg: "#F1F5F9" },
  CONTEST_SETTLED: { icon: "trophy", iconColor: "#D97706", iconBg: "#FEF3C7" },
  CONTEST_JOINED: { icon: "checkmark-circle", iconColor: "#00C987", iconBg: "#E6FBF3" },
  CONTEST_WON: { icon: "trophy", iconColor: "#F59E0B", iconBg: "#FEF3C7" },
  CONTEST_LOST: { icon: "analytics-outline", iconColor: "#64748B", iconBg: "#F1F5F9" },
  CONTEST_CANCELLED: { icon: "alert-circle", iconColor: "#EF4444", iconBg: "#FEE2E2" },
};

export function fetchProfileData() {
  return result(getProfileMe);
}

export function fetchKycDetails() {
  return result(async () => {
    const status = await getOnboardingStatus();
    return {
      mobileStatus: status.mobileOtp?.completed ? "VERIFIED" : "PENDING",
      aadhaarStatus: status.aadhaarKyc?.completed ? "VERIFIED" : "PENDING",
      walletStatus: status.wallet?.linked ? "LINKED" : "PENDING",
      kycOverallStatus: status.aadhaarKyc?.completed ? "VERIFIED" : "PENDING",
      aadhaarMethod: status.aadhaarKyc?.method?.label || null,
      walletNetwork: status.wallet?.network || null,
    };
  });
}

export function fetchUserPredictions({ filter = "ALL" } = {}) {
  const backendStatus = filter === "ACTIVE" ? "ACTIVE" : filter === "SETTLED" ? "SETTLED" : "ALL";
  return result(async () => {
    const response = await getProfilePredictions(backendStatus);
    return (response.entries || []).map(mapPrediction);
  });
}

export function fetchUserWinnings() {
  return result(async () => {
    const response = await getProfileWinnings();
    return {
      totalRewardCredits: Number(response.totalRewardCredits || 0),
      winCount: Number(response.winCount || 0),
      topWins: (response.rewards || []).map(mapPrediction),
    };
  });
}

export function fetchNotifications() {
  return result(async () => {
    const response = await getProfileNotifications();
    return (response.notifications || []).map((notification) => ({
      ...notification,
      read: Boolean(notification.read_at),
      time: dateLabel(notification.created_at),
      ...(notificationPresentation[notification.type] || { icon: "notifications", iconColor: "#2563EB", iconBg: "#DBEAFE" }),
    }));
  });
}

export function readNotification(id) {
  return result(() => markProfileNotificationRead(id));
}

export function readAllNotifications() {
  return result(markAllProfileNotificationsRead);
}

export function fetchNotificationPreferences() {
  return result(async () => (await getNotificationPreferences()).preferences);
}

export function saveNotificationPreferences(payload) {
  return result(async () => (await updateNotificationPreferences(payload)).preferences);
}
