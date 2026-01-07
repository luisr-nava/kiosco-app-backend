import { useQuery } from "@tanstack/react-query";
import { getExpensesAction } from "../actions";
import { useShopStore } from "@/features/shop/shop.store";

interface UseExpenseQueryParams {
  search: string;
  page: number;
  limit?: number;
  enabled?: boolean;
}

export const useExpenseQuery = ({
  search,
  page,
  limit = 10,
  enabled = true,
}: UseExpenseQueryParams) => {
  const { activeShopId } = useShopStore();

  const query = useQuery({
    queryKey: ["expenses", activeShopId, search, page, limit],
    queryFn: () =>
      getExpensesAction(activeShopId!, {
        search,
        limit,
        page,
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
