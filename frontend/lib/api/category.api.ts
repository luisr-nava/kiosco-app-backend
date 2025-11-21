import { kioscoApi } from "@/lib/kioscoApi";
import type { Category, CreateCategoryDto, CategoryType } from "@/lib/types/category";

const CATEGORY_BASE_PATH = "/category";

export const categoryApi = {
  listByShop: async (
    shopId: string,
    type: CategoryType,
  ): Promise<Category[] | { data: Category[] }> => {
    const { data } = await kioscoApi.get(CATEGORY_BASE_PATH, {
      params: { shopId, type },
    });
    return data;
  },
  create: async (payload: CreateCategoryDto): Promise<Category> => {
    const { data } = await kioscoApi.post(CATEGORY_BASE_PATH, payload);
    return (data as any)?.data ?? data;
  },
};
