import { Stack, useRouter } from "expo-router";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { subscribeToPushEvents } from "../src/services/pushNotifications";

function PushNotificationRuntime() {
  const router = useRouter();

  useEffect(() => subscribeToPushEvents(router), [router]);
  return null;
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <PushNotificationRuntime />
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
    </SafeAreaProvider>
  );
}
