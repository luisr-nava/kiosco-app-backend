import { useInfiniteQuery } from "@tanstack/react-query";
import { getPaymentMethodsAction } from "../actions";
import { useShopStore } from "@/features/shop/shop.store";

const DEFAULT_LIMIT = 10;

export const usePaymentMethods = () => {
  const { activeShopId } = useShopStore();

  const query = useInfiniteQuery({
    queryKey: ["payment-methods", activeShopId, DEFAULT_LIMIT],
    queryFn: ({ pageParam = 1 }) =>
      getPaymentMethodsAction({
        shopId: activeShopId || "",
        page: Number(pageParam) || 1,
        limit: DEFAULT_LIMIT,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const currentPage = lastPage?.pagination?.page ?? 1;
      const totalPages = lastPage?.pagination?.totalPages ?? 1;

      const nextPage = currentPage + 1;
      return nextPage <= totalPages ? nextPage : undefined;
    },
    enabled: Boolean(activeShopId),
    staleTime: 1000 * 30,
  });

  return {
    paymentMethods: query.data?.pages.flatMap((page) => page.paymentMethods) || [],
    pagination: query.data?.pages.at(-1)?.pagination,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    fetchNextPaymentMethods: query.fetchNextPage,
    hasMorePaymentMethods: query.hasNextPage ?? false,
    isFetchingNextPaymentMethods: query.isFetchingNextPage,
  };
};
