import { kioscoApi } from "@/lib/kioscoApi";
import type {
  NotificationEvent,
  NotificationPreferences,
} from "@/lib/types/notification";

const NOTIFICATION_BASE_PATH = "/notifications";

export const notificationApi = {
  list: async (): Promise<NotificationEvent[]> => {
    const { data } = await kioscoApi.get<NotificationEvent[]>(
      NOTIFICATION_BASE_PATH
    );
    return data;
  },

  markAsRead: async (id: string): Promise<NotificationEvent> => {
    const { data } = await kioscoApi.patch<NotificationEvent>(
      `${NOTIFICATION_BASE_PATH}/${id}/read`,
      {}
    );
    return data;
  },

  getPreferences: async (shopId: string): Promise<NotificationPreferences> => {
    const { data } = await kioscoApi.get<NotificationPreferences>(
      `/shops/${shopId}/preferences/notifications`
    );
    return data;
  },

  updatePreferences: async (
    shopId: string,
    payload: NotificationPreferences
  ): Promise<NotificationPreferences> => {
    const { data } = await kioscoApi.put<NotificationPreferences>(
      `/shops/${shopId}/preferences/notifications`,
      payload
    );
    return data;
  },
};
