import { useQuery } from "@tanstack/react-query";
import { getSuppliersAction } from "../actions";
import { useShopStore } from "@/features/shop/shop.store";

interface UseSupplierQueryParams {
  search: string;
  page: number;
  limit?: number;
  enabled?: boolean;
  startDate?: string;
  endDate?: string;
}
export const useSupplierQuery = ({
  search,
  page,
  limit = 10,
  enabled = true,
  startDate,
  endDate,
}: UseSupplierQueryParams) => {
  const { activeShopId } = useShopStore();
  const query = useQuery({
    queryKey: [
      "suppliers",
      activeShopId,
      search,
      page,
      limit,
      startDate,
      endDate,
    ],
    queryFn: () =>
      getSuppliersAction(activeShopId!, {
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

  const suppliers = query.data?.suppliers || [];
  const pagination = query.data?.pagination;

  return {
    suppliers,
    pagination,
    supplierLoading: query.isLoading,
    isFetching: query.isFetching,
    refetch: query.refetch,
  };
};

