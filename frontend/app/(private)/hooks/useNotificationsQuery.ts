"use client";

import { useQuery } from "@tanstack/react-query";
import { useShopStore } from "@/app/(private)/store/shops.slice";
import { notificationApi } from "@/lib/api/notification.api";
import { useNotificationsStore } from "@/app/(private)/store/notifications.slice";

export const useNotificationsQuery = () => {
  const activeShopId = useShopStore((state) => state.activeShopId);
  const setNotifications = useNotificationsStore((state) => state.setNotifications);

  return useQuery({
    queryKey: ["notifications", activeShopId],
    queryFn: () => notificationApi.list(),
    enabled: Boolean(activeShopId),
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    
  });
};
