import { kioscoApi } from "@/lib/kioscoApi";
import {
  CategoryProduct,
  CategorySupplier,
  CreateCategoryProductDto,
  CreateCategorySupplierDto,
} from "../interfaces";


export const updateCategorySupplierAction = async (
  id: string,
  payload: Partial<CreateCategorySupplierDto>
): Promise<CategorySupplier> => {
  const { data } = await kioscoApi.patch<{
    data: { categorySupplier: CategorySupplier };
  }>(`/supplier-category/${id}`, payload);
  return data.data.categorySupplier;
};
