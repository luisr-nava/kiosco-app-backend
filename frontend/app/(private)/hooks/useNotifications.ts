"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { notificationApi } from "@/lib/api/notification.api";
import { getErrorMessage } from "@/lib/error-handler";
import { useNotificationsStore } from "@/app/(private)/store/notifications.slice";

const isRead = (notification: { isRead?: boolean; readAt?: string | null }) =>
  Boolean(notification.isRead || notification.readAt);

export const useNotifications = () => {
  const {
    notifications,
    unreadCount,
    addNotification,
    setNotifications,
    markAsRead,
    markAllAsRead: markAllAsReadStore,
  } = useNotificationsStore();

  const [isUpdating, setIsUpdating] = useState(false);

  const refreshNotifications = useCallback(async () => {
    setIsUpdating(true);
    try {
      const latest = await notificationApi.list();
      setNotifications(latest);
    } catch (error) {
      const { title, message } = getErrorMessage(
        error,
        "No se pudieron actualizar las notificaciones",
      );
      toast.error(title, { description: message });
    } finally {
      setIsUpdating(false);
    }
  }, [setNotifications]);

  const markNotificationAsRead = useCallback(
    async (id: string) => {
      if (!id) return;

      markAsRead(id);

      try {
        const updated = await notificationApi.markAsRead(id);
        addNotification(updated);
      } catch (error) {
        const { title, message } = getErrorMessage(
          error,
          "No se pudo marcar la notificación como leída",
        );
        toast.error(title, { description: message });
        refreshNotifications();
      }
    },
    [markAsRead, addNotification, refreshNotifications],
  );

  const markAllAsRead = useCallback(async () => {
    const unreadIds = notifications
      .filter((notification) => !isRead(notification))
      .map((notification) => notification.id);

    if (unreadIds.length === 0) return;

    markAllAsReadStore();

    try {
      await Promise.all(unreadIds.map((id) => notificationApi.markAsRead(id)));
      await refreshNotifications();
    } catch (error) {
      const { title, message } = getErrorMessage(
        error,
        "No se pudieron marcar todas como leídas",
      );
      toast.error(title, { description: message });
      refreshNotifications();
    }
  }, [notifications, markAllAsReadStore, refreshNotifications]);

  return {
    notifications,
    unreadCount,
    isUpdating,
    refreshNotifications,
    markNotificationAsRead,
    markAllAsRead,
  };
};
