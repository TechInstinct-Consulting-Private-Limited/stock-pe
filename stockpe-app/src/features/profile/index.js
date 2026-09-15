// Feature Barrel Export: Profile Module
export { default as KycScreen } from "./screens/KycScreen";
export { default as MyPredictionsScreen } from "./screens/MyPredictionsScreen";
export { default as MyWinningsScreen } from "./screens/MyWinningsScreen";
export { default as NotificationsScreen } from "./screens/NotificationsScreen";

export * from "./hooks/useProfileKyc";
export * from "./hooks/useUserPredictions";
export * from "./hooks/useUserWinnings";
export * from "./hooks/useNotifications";
export * from "./services/profileService";
