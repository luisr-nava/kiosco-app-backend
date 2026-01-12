import { useQuery } from "@tanstack/react-query";
import { useShopStore } from "@/features/shop/shop.store";
import {
  getAllSalesAction,
  SaleQueryParams,
} from "../actions/get-all-sales.action";

export const useSalesQuery = (params: SaleQueryParams) => {
  const { activeShopId } = useShopStore();

  const query = useQuery({
    queryKey: ["sales", activeShopId, params],
    queryFn: () => getAllSalesAction(activeShopId!, { ...params }),
    enabled: Boolean(activeShopId),
  });
  const sales = query.data?.sales || [];
  const pagination = query.data?.pagination;
  return {
    sales,
    pagination,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
  };
};
