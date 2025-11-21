import { kioscoApi } from "@/lib/kioscoApi";
import type { Product, CreateProductDto } from "@/lib/types/product";

const PRODUCT_BASE_PATH = "/product";

export const productApi = {
  listByShop: async (
    shopId: string,
    params?: { search?: string; page?: number; limit?: number },
  ): Promise<Product[] | { data: Product[]; meta?: any }> => {
    const { data } = await kioscoApi.get(`${PRODUCT_BASE_PATH}`, {
      params: { shopId, ...params },
    });
    return data;
  },
  create: async (payload: CreateProductDto): Promise<Product> => {
    const { data } = await kioscoApi.post(PRODUCT_BASE_PATH, payload);
    return (data as any)?.data ?? data;
  },
  update: async (id: string, payload: CreateProductDto): Promise<Product> => {
    const { data } = await kioscoApi.put(`${PRODUCT_BASE_PATH}/${id}`, payload);
    return (data as any)?.data ?? data;
  },
};
