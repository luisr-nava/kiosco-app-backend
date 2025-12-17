import { kioscoApi } from "@/lib/kioscoApi";
import type { Product } from "@/app/(private)/dashboard/products/interfaces";
import { unwrapResponse } from "./utils";

const PRODUCT_BASE_PATH = "/product";

export const productApi = {
  listByShop: async (
    shopId: string,
    params?: { limit?: number; page?: number; search?: string },
  ): Promise<Product[]> => {
    const { data } = await kioscoApi.get<Product[] | { data: Product[] }>(
      PRODUCT_BASE_PATH,
      {
        params: {
          shopId,
          limit: params?.limit ?? 100,
          page: params?.page ?? 1,
          search: params?.search,
        },
      },
    );
    return unwrapResponse(data);
  },
};
