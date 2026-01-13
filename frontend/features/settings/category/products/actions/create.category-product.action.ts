import { kioscoApi } from "@/lib/kioscoApi";
import {
  CategoryProduct,
  CreateCategoryProductDto,
  CreateCategoryProductResponse,
} from "../types";

export const createCategoryProductAction = async (
  payload: Partial<CreateCategoryProductDto>
): Promise<CategoryProduct> => {
  const { data } = await kioscoApi.post<CreateCategoryProductResponse>(
    "/product-category",
    payload
  );

  return data.data.categoryProduct;
};
