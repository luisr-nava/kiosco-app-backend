import { useQuery } from "@tanstack/react-query";
import { useShopStore } from "@/features/shop/shop.store";
import { getAllAnalyticsAction } from "../actions/get-all.analytics";
type GetAnalyticsParams = {
  period: "week" | "month" | "year";
  month?: string;
  from?: string;
  to?: string;
};

export const useAnalyticsQuery = (params: GetAnalyticsParams = { period: "week" }) => {
  const { activeShopId } = useShopStore();

  const query = useQuery({
    queryKey: ["analytics", activeShopId, params],
    queryFn: () => {
      if (!activeShopId) {
        throw new Error("activeShopId is required");
      }
      return getAllAnalyticsAction(activeShopId, params);
    },
    enabled: Boolean(activeShopId),
    staleTime: 1000 * 60 * 5,
  });

  return {
    analytics: query.data,
    analyticsLoading: query.isLoading,
    refetch: query.refetch,
  };
};
