import { useShopStore } from "@/features/shop/shop.store";
import { useAnalitycs } from "./useAnalitycs";

export const useDashboardPage = () => {
  const { activeShopId } = useShopStore();
  const { analytics, analyticsLoading } = useAnalitycs();
  return { analytics, analyticsLoading, activeShopId };
};

