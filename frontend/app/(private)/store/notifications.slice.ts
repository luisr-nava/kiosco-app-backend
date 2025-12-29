import { create } from "zustand";
import type { NotificationEvent } from "@/lib/types/notification";

const sortByDateDesc = (notifications: NotificationEvent[]) =>
  [...notifications].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

const isNotificationRead = (notification: NotificationEvent) =>
  Boolean(notification.readAt || notification.isRead);

const getUnreadCount = (notifications: NotificationEvent[]) =>
  notifications.reduce(
    (count, notification) =>
      isNotificationRead(notification) ? count : count + 1,
    0,
  );

const dedupeNotifications = (notifications: NotificationEvent[]) => {
  const unique: NotificationEvent[] = [];

  notifications.forEach((notification) => {
    if (!unique.some((item) => item.id === notification.id)) {
      unique.push(notification);
    }
  });

  return unique;
};

const buildNotificationsState = (notifications: NotificationEvent[]) => {
  const sorted = sortByDateDesc(dedupeNotifications(notifications));

  return {
    notifications: sorted,
    unreadCount: getUnreadCount(sorted),
  };
};

interface NotificationsState {
  notifications: NotificationEvent[];
  unreadCount: number;
  setNotifications: (notifications: NotificationEvent[]) => void;
  addNotification: (notification: NotificationEvent) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

export const useNotificationsStore = create<NotificationsState>((set) => ({
  notifications: [],
  unreadCount: 0,

  setNotifications: (notifications) =>
    set(() => buildNotificationsState(notifications)),

  addNotification: (notification) =>
    set((state) =>
      buildNotificationsState([notification, ...state.notifications]),
    ),

  markAsRead: (id) =>
    set((state) => {
      const updated = state.notifications.map((notification) =>
        notification.id === id
          ? {
              ...notification,
              isRead: true,
              readAt: notification.readAt ?? new Date().toISOString(),
            }
          : notification,
      );

      return {
        notifications: updated,
        unreadCount: getUnreadCount(updated),
      };
    }),

  markAllAsRead: () =>
    set((state) => {
      const updated = state.notifications.map((notification) =>
        isNotificationRead(notification)
          ? notification
          : {
              ...notification,
              isRead: true,
              readAt: notification.readAt ?? new Date().toISOString(),
            },
      );

      return {
        notifications: updated,
        unreadCount: getUnreadCount(updated),
      };
    }),
}));
