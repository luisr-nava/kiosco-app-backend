import { kioscoApi } from "@/lib/kioscoApi";
import { CategoryProduct, CategorySupplier } from "../interfaces";
import { Pagination } from "@/app/(protected)/interfaces";

export const GetAllCategorySupplierAction = async (params?: {
  page?: number;
  limit?: number;
}): Promise<{
  categorySuppliers: CategorySupplier[];
  pagination: Pagination;
}> => {
  const { data } = await kioscoApi.get<{
    data: CategorySupplier[];
    pagination: Pagination;
  }>(`/supplier-category`, {
    params: {
      page: params?.page ?? 1,
      limit: params?.limit ?? 10,
    },
  });

  return {
    categorySuppliers: data.data,
    pagination: data.pagination,
  };
};
