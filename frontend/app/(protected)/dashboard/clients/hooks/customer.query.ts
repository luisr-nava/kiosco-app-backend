import { useQuery } from "@tanstack/react-query";
import { getAllCustomerAction } from "../actions/get-all.customer.action";
import { useShopStore } from "@/features/shop/shop.store";

interface UseCustomerQueryParams {
  search: string;
  page: number;
  limit?: number;
}

export const useCustomerQuery = ({
  search,
  page,
  limit = 10,
}: UseCustomerQueryParams) => {
  const { activeShopId } = useShopStore();

  const query = useQuery({
    queryKey: ["customers", activeShopId, search, page, limit],
    queryFn: () =>
      getAllCustomerAction(activeShopId!, {
        search,
        limit,
        page,
      }),
    enabled: Boolean(activeShopId),
    staleTime: 1000 * 30,
  });

  const customers = query.data?.customers || [];
  const pagination = query.data?.pagination;

  return {
    customers,
    pagination,
    customersLoading: query.isLoading,
    isFetching: query.isFetching,
    refetch: query.refetch,
  };
};

