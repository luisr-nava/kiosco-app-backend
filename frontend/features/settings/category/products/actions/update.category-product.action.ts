import { kioscoApi } from "@/lib/kioscoApi";
import { CategoryProduct, CreateCategoryProductDto } from "../types";

export const updateCategoryProductAction = async (
  id: string,
  payload: Partial<CreateCategoryProductDto>
): Promise<CategoryProduct> => {
  const { data } = await kioscoApi.patch<{
    data: { categoryProduct: CategoryProduct };
  }>(`/product-category/${id}`, payload);
  return data.data.categoryProduct;
};
