import { kioscoApi } from "@/lib/kioscoApi";
import { CategoryProduct, CategorySupplier } from "../interfaces";
import { Pagination } from "@/app/(private)/interfaces";

export const GetAllCategoryProductAction = async (params?: {
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


