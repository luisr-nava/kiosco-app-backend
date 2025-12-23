import { kioscoApi } from "@/lib/kioscoApi";
import {
  CategoryProduct,
  CategorySupplier,
  CreateCategoryProductDto,
  CreateCategorySupplierDto,
} from "../interfaces";

export const updateCategoryProductAction = async (
  id: string,
  payload: Partial<CreateCategoryProductDto>,
): Promise<CategoryProduct> => {
  const { data } = await kioscoApi.patch<{
    data: { categoryProduct: CategoryProduct };
  }>(`/product-category/${id}`, payload);
  return data.data.categoryProduct;
};

export const updateCategorySupplierAction = async (
  id: string,
  payload: Partial<CreateCategorySupplierDto>,
): Promise<CategorySupplier> => {
  const { data } = await kioscoApi.patch<{ data: { categorySupplier: CategorySupplier } }>(
    `/supplier-category/${id}`,
    payload,
  );
  return data.data.categorySupplier;
};

