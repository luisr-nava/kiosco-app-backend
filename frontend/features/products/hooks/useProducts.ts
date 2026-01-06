import { useProductQuery } from "@/features/products/hooks/useProductQuery";

interface UseProductsParams {
  search?: string;
  categoryId?: string;
  supplierId?: string;
  page: number;
  limit?: number;
  enabled?: boolean;
}

export const useProducts = ({ ...params }: UseProductsParams) => {
  const { products, pagination, productsLoading, isFetching, refetch } =
    useProductQuery(params);

  return {
    products,
    pagination,
    productsLoading,
    isFetching,
    refetch,
  };
};

