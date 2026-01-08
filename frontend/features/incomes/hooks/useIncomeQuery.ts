import { useQuery } from "@tanstack/react-query";
import { getIncomesAction } from "../actions";
import { useShopStore } from "@/features/shop/shop.store";

interface UseIncomesQueryParams {
  search: string;
  page: number;
  limit?: number;
  enabled?: boolean;
}
export const useIncomeQuery = ({
  search,
  page,
  limit = 10,
  enabled = true,
}: UseIncomesQueryParams) => {
  const { activeShopId } = useShopStore();

  const query = useQuery({
    queryKey: ["incomes", activeShopId, search, page, limit],
    queryFn: () =>
      getIncomesAction(activeShopId!, {
        search,
        page,
        limit,
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
