import { useInfiniteQuery } from "@tanstack/react-query";
import { getAllCategoryProductAction } from "../actions";

const DEFAULT_LIMIT = 10;

export const useCategoryProductsQuery = () => {
  const query = useInfiniteQuery({
    queryKey: ["category-products", DEFAULT_LIMIT],
    queryFn: ({ pageParam = 1 }) =>
      getAllCategoryProductAction({
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
    retry: 1,
  });

  const categoryProducts =
    query.data?.pages.flatMap((page) => page.categoryProducts) || [];
  const pagination = query.data?.pages.at(-1)?.pagination;

  return {
    categoryProducts,
    pagination,
    categoryProductsLoading: query.isLoading,
    fetchNextProductCategories: query.fetchNextPage,
    hasMoreProductCategories: query.hasNextPage ?? false,
    isFetchingNextProductCategories: query.isFetchingNextPage,
  };
};
