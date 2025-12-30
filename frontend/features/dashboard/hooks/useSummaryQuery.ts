import { useQuery } from "@tanstack/react-query";
import { getAllSummaryAction } from "../actions/get-all.summary";
import { useShopStore } from "@/features/shop/shop.store";

export const useSummaryQuery = () => {
  const { activeShopId } = useShopStore();

  return useQuery({
    queryKey: ["summary"],
    queryFn: () => getAllSummaryAction(activeShopId!),
    enabled: !!activeShopId,
  });
};

