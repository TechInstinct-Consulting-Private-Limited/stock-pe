import { useState, useEffect, useCallback } from "react";
import { fetchNotifications, readAllNotifications, readNotification } from "../services/profileService";
import { subscribeToInboxRefresh } from "../../../services/pushNotifications";

export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const refreshNotifications = useCallback(() => {
    setIsLoading(true);
    return fetchNotifications().then((res) => {
      setIsLoading(false);
      if (res.success) {
        setNotifications(res.data);
      }
    });
  }, []);

  useEffect(() => {
    refreshNotifications();
    return subscribeToInboxRefresh(refreshNotifications);
  }, [refreshNotifications]);

  const handleMarkAllAsRead = async () => {
    const response = await readAllNotifications();
    if (!response.success) return;
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleNotificationPress = async (notification) => {
    const response = await readNotification(notification.id);
    if (!response.success) return;
    setNotifications((prev) =>
      prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n))
    );
    return notification.metadata?.publicId || notification.deep_link || null;
  };

  return {
    notifications,
    isLoading,
    handleMarkAllAsRead,
    handleNotificationPress,
    refreshNotifications,
  };
}
