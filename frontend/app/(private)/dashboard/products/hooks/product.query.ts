import { useShopStore } from "@/app/(private)/store/shops.slice";
import { useQuery } from "@tanstack/react-query";
import { GetAllProductAction } from "../actions/get-all.product.action";

interface UseProductQueryParams {
  search: string;
  page: number;
  limit?: number;
  enabled?: boolean;
}

export const useProductQuery = ({
  search,
  page,
  limit = 10,
  enabled = true,
}: UseProductQueryParams) => {
  const { activeShopId } = useShopStore();

  const query = useQuery({
    queryKey: ["products", activeShopId, search, page, limit],
    queryFn: () =>
      GetAllProductAction(activeShopId || "", {
        search,
        page,
        limit,
      }),
    enabled: enabled && Boolean(activeShopId),
  });

  const products = query.data?.products || [];
  const pagination = query.data?.pagination;

  return {
    products,
    pagination,
    productsLoading: query.isLoading,
    isFetching: query.isFetching,
    refetch: query.refetch,
  };
};
