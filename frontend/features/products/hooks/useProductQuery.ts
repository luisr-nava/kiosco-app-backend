import { useQuery } from "@tanstack/react-query";
import { GetAllProductAction } from "../actions/get-all.product.action";
import { useShopStore } from "@/features/shop/shop.store";
import { ProductQueryParams } from "../types";

export const useProductQuery = (params: Omit<ProductQueryParams, "shopId">) => {
  const { activeShopId } = useShopStore();

  const query = useQuery({
    queryKey: [
      "products",
      activeShopId,
      params.page,
      params.limit,
      params.search ?? "",
      params.categoryId ?? "",
      params.supplierId ?? "",
    ],
    queryFn: () =>
      GetAllProductAction({
        ...params,
        shopId: activeShopId!,
      }),
    enabled: Boolean(activeShopId),
    staleTime: 5000,
    refetchOnWindowFocus: false,
    retry: false,
  });

  return {
    products: query.data?.products ?? [],
    pagination: query.data?.pagination,
    productsLoading: query.isLoading,
    isFetching: query.isFetching,
    refetch: query.refetch,
  };
};
