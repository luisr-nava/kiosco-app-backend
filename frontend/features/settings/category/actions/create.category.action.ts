import { kioscoApi } from "@/lib/kioscoApi";
import {
  CategoryProduct,
  CategorySupplier,
  CreateCategoryProductDto,
  CreateCategoryProductResponse,
  CreateCategorySupplierDto,
  CreateCategorySupplierResponse,
} from "../interfaces";

export const createCategorySuppliertAction = async (
  payload: Partial<CreateCategorySupplierDto>
): Promise<CategorySupplier> => {
  const { data } = await kioscoApi.post<CreateCategorySupplierResponse>(
    "/supplier-category",
    payload
  );

  return data.data.categorySupplier;
};
