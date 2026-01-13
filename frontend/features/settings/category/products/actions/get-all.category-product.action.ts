import { Pagination } from "@/src/types";
import { kioscoApi } from "@/lib/kioscoApi";
import { CategoryProduct } from "../types";

export const getAllCategoryProductAction = async (params?: {
  page?: number;
  limit?: number;
}): Promise<{
  categoryProducts: CategoryProduct[];
  pagination: Pagination;
}> => {
  const { data } = await kioscoApi.get<{
    data: CategoryProduct[];
    pagination: Pagination;
  }>(`/product-category`, {
    params: {
      page: params?.page ?? 1,
      limit: params?.limit ?? 10,
    },
  });

  return {
    categoryProducts: data.data,
    pagination: data.pagination,
  };
};
