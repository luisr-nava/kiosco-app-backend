import { useQuery } from "@tanstack/react-query";
import { getIncomesAction } from "../actions";
import { useShopStore } from "@/features/shop/shop.store";

export const useIncomeQuery = (
  search: string,
  page: number,
  limit: number,
  enabled: boolean,
  startDate?: string,
  endDate?: string,
) => {
  const { activeShopId } = useShopStore();

  return useQuery({
    queryKey: [
      "incomes",
      activeShopId,
      search,
      page,
      limit,
      startDate,
      endDate,
    ],
    queryFn: () =>
      getIncomesAction(activeShopId || "", {
        search: search || undefined,
        page,
        limit,
        startDate,
        endDate,
      }),
    enabled,
  });
};

