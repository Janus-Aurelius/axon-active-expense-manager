import { useState, useEffect, useCallback } from "react";
import {
  notificationApiService,
  NotificationResponse,
} from "@/lib/api/notification-api";

export interface UseNotificationsReturn {
  // Data
  notifications: NotificationResponse[];
  unreadNotifications: NotificationResponse[];
  unreadCount: number;

  // Loading states
  loading: boolean;

  // Error states
  error: string | null;

  // Actions
  refreshNotifications: () => Promise<void>;
  markAsRead: (notificationId: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

export function useNotifications(): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<NotificationResponse[]>(
    [],
  );
  const [unreadNotifications, setUnreadNotifications] = useState<
    NotificationResponse[]
  >([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [allNotifications, unreadNotifs, count] = await Promise.all([
        notificationApiService.getAllNotifications(),
        notificationApiService.getUnreadNotifications(),
        notificationApiService.getUnreadNotificationCount(),
      ]);

      setNotifications(allNotifications);
      setUnreadNotifications(unreadNotifs);
      setUnreadCount(count);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch notifications",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (notificationId: number) => {
    try {
      await notificationApiService.markNotificationAsRead(notificationId);

      // Update local state
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId ? { ...notif, isRead: true } : notif,
        ),
      );
      setUnreadNotifications((prev) =>
        prev.filter((notif) => notif.id !== notificationId),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Error marking notification as read:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to mark notification as read",
      );
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationApiService.markAllNotificationsAsRead();

      // Update local state
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, isRead: true })),
      );
      setUnreadNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to mark all notifications as read",
      );
    }
  }, []);

  // Initial load
  useEffect(() => {
    refreshNotifications();
  }, [refreshNotifications]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refreshNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, [refreshNotifications]);

  return {
    notifications,
    unreadNotifications,
    unreadCount,
    loading,
    error,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
  };
}
