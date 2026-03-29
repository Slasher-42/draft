import { useState, useEffect, useCallback } from "react";
import { notificationService } from "@/services/notificationService";

export interface Notification {
  id: number;
  recipientUserId: number;
  type: string;
  message: string;
  relatedExecutionId: number | null;
  read: boolean;
  createdAt: string;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount]     = useState(0);
  const [isLoading, setIsLoading]         = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await notificationService.getAll();
      const data: Notification[] = res.data?.data ?? [];
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.read).length);
    } catch {
      // silent fail — bell just shows nothing
    }
  }, []);

  useEffect(() => {
    setIsLoading(true);
    fetchNotifications().finally(() => setIsLoading(false));

    const interval = setInterval(fetchNotifications, 30_000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markAsRead = async (id: number) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {}
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {}
  };

  return { notifications, unreadCount, isLoading, markAsRead, markAllAsRead, refetch: fetchNotifications };
}