import { useQuery } from "@tanstack/react-query";
import { getAllCustomerAction } from "../actions/get-all.customer.action";
import { useShopStore } from "@/features/shop/shop.store";

interface UseCustomerQueryParams {
  search?: string;
  page?: number;
  limit?: number;
}

export const useCustomerQuery = (params: UseCustomerQueryParams) => {
  const { activeShopId } = useShopStore();

  const query = useQuery({
    queryKey: ["customers", activeShopId, params.page, params.limit, params.search ?? ""],
    queryFn: () =>
      getAllCustomerAction(activeShopId!, {
        ...params,
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
