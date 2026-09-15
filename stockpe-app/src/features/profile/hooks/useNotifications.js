import { useState, useEffect } from "react";
import {
  NOTIFICATIONS_DATA,
  fetchNotifications,
} from "../services/profileService";

export function useNotifications() {
  const [notifications, setNotifications] = useState(NOTIFICATIONS_DATA);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    fetchNotifications().then((res) => {
      setIsLoading(false);
      if (res.success) {
        setNotifications(res.data);
      }
    });
  }, []);

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleNotificationPress = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  return {
    notifications,
    isLoading,
    handleMarkAllAsRead,
    handleNotificationPress,
  };
}
