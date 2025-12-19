import { useQuery } from "@tanstack/react-query";
import { useShopStore } from "@/app/(private)/store/shops.slice";
import { getExpensesAction } from "../actions";

interface UseExpenseQueryParams {
  search: string;
  page: number;
  limit?: number;
  enabled?: boolean;
  startDate?: string;
  endDate?: string;
}

export const useExpenseQuery = ({
  search,
  page,
  limit = 10,
  enabled = true,
  startDate,
  endDate,
}: UseExpenseQueryParams) => {
  const { activeShopId } = useShopStore();

  const query = useQuery({
    queryKey: ["expenses", activeShopId, search, page, limit, startDate, endDate],
    queryFn: () =>
      getExpensesAction(activeShopId!, {
        search,
        limit,
        page,
        startDate,
        endDate,
      }),
    enabled: enabled && Boolean(activeShopId),
    staleTime: 1000 * 30,
    placeholderData: (prev) => prev,
  });

  const expenses = query.data?.expenses || [];
  const pagination = query.data?.pagination;

  return {
    expenses,
    pagination,
    expensesLoading: query.isLoading,
    isFetching: query.isFetching,
    refetch: query.refetch,
  };
};
