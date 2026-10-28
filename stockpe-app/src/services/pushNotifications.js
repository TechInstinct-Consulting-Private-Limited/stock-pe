import Constants from "expo-constants";
import { DeviceEventEmitter, NativeModules, Platform } from "react-native";
import { registerExpoPushToken } from "./api";

const INBOX_EVENT = "stockpe:notification-received";
// Expo Go can be older than the native module required by the installed SDK.
// Never import expo-notifications there: in-app notifications must keep working.
const supportsNativePush = Platform.OS !== "web" && Boolean(NativeModules.ExpoTopicSubscriptionModule);
let Notifications = null;

if (supportsNativePush) {
  try {
    Notifications = require("expo-notifications");
  } catch (_error) {
    Notifications = null;
  }
}

if (Notifications) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}

function projectId() {
  return Constants.expoConfig?.extra?.eas?.projectId || Constants.easConfig?.projectId || null;
}

export function notificationRoute(data = {}) {
  const deepLink = String(data.deepLink || data.deep_link || "").trim();
  const contestId = String(data.publicId || "").trim();

  if (contestId) return { pathname: "/event/[id]", params: { id: contestId } };
  const matchedContest = deepLink.match(/^\/events?\/([^/?#]+)/);
  if (matchedContest) return { pathname: "/event/[id]", params: { id: matchedContest[1] } };
  if (deepLink === "/profile/notifications") return "/profile/notifications";
  if (deepLink === "/(tabs)/wallet" || deepLink === "/wallet") return "/(tabs)/wallet";
  return "/profile/notifications";
}

export async function registerCurrentDeviceForPush({ requestPermission = false } = {}) {
  // Push tokens only exist on installed mobile builds. Web keeps the in-app inbox.
  if (!Notifications) return { registered: false, reason: "native-module-unavailable" };

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "StockPE alerts",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#00C987",
    });
  }

  const existing = await Notifications.getPermissionsAsync();
  const permission = existing.status === "granted"
    ? existing
    : requestPermission
      ? await Notifications.requestPermissionsAsync()
      : existing;
  if (permission.status !== "granted") return { registered: false, reason: "permission-denied" };

  const configuredProjectId = projectId();
  if (!configuredProjectId) return { registered: false, reason: "missing-project-id" };

  const token = (await Notifications.getExpoPushTokenAsync({ projectId: configuredProjectId })).data;
  await registerExpoPushToken(token, Platform.OS);
  return { registered: true, token };
}

export function subscribeToPushEvents(router) {
  if (!Notifications) return () => {};
  const received = Notifications.addNotificationReceivedListener((notification) => {
    DeviceEventEmitter.emit(INBOX_EVENT, notification.request.content.data || {});
  });
  const opened = Notifications.addNotificationResponseReceivedListener((response) => {
    const data = response.notification.request.content.data || {};
    DeviceEventEmitter.emit(INBOX_EVENT, data);
    router.push(notificationRoute(data));
  });

  Notifications.getLastNotificationResponseAsync().then((response) => {
    if (response) router.push(notificationRoute(response.notification.request.content.data || {}));
  }).catch(() => {});

  return () => { received.remove(); opened.remove(); };
}

export function subscribeToInboxRefresh(listener) {
  const subscription = DeviceEventEmitter.addListener(INBOX_EVENT, listener);
  return () => subscription.remove();
}
