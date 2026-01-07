import { useQuery } from "@tanstack/react-query";
import { getIncomesAction } from "../actions";
import { useShopStore } from "@/features/shop/shop.store";

interface UseIncomesQueryParams {
  search: string;
  page: number;
  limit?: number;
  enabled?: boolean;
  startDate?: string;
  endDate?: string;
}
export const useIncomeQuery = ({
  search,
  page,
  limit = 10,
  enabled = true,
  startDate,
  endDate,
}: UseIncomesQueryParams) => {
  const { activeShopId } = useShopStore();

  const query = useQuery({
    queryKey: ["incomes", activeShopId, search, page, limit, startDate, endDate],
    queryFn: () =>
      getIncomesAction(activeShopId!, {
        search,
        page,
        limit,
        startDate,
        endDate,
      }),
    enabled: enabled && Boolean(activeShopId),
    staleTime: 1000 * 30,
    placeholderData: (prev) => prev,
  });
  const incomes = query.data?.incomes || [];
  const pagination = query.data?.pagination;

  return {
    incomes,
    pagination,
    incomesLoading: query.isLoading,
    isFetching: query.isFetching,
    refetch: query.refetch,
  };
};
