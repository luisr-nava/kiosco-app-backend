import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { getMeasurementUnitsAction } from "../actions";
import { useShopStore } from "@/features/shop/shop.store";
const DEFAULT_LIMIT = 10;

export const useMeasurementUnits = () => {
  const { activeShopId } = useShopStore();

  const query = useInfiniteQuery({
    queryKey: ["measurement-units", activeShopId],
    queryFn: ({ pageParam = 1 }) =>
      getMeasurementUnitsAction({
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
    measurementUnits:
      query.data?.pages.flatMap((page) => page.measurementUnits) || [],
    pagination: query.data?.pages.at(-1)?.pagination,
    isLoadingMeasurement: query.isLoading,
    isFetching: query.isFetching,
    fetchNextMeasurement: query.fetchNextPage,
    hasMoreMeasurement: query.hasNextPage ?? false,
    isFetchingNextMeasurement: query.isFetchingNextPage,
  };
};
