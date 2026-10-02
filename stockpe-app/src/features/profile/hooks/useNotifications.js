import { useState, useEffect } from "react";
import { fetchNotifications, readAllNotifications, readNotification } from "../services/profileService";

export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
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

  const handleMarkAllAsRead = async () => {
    const response = await readAllNotifications();
    if (!response.success) return;
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleNotificationPress = async (id) => {
    const response = await readNotification(id);
    if (!response.success) return;
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
