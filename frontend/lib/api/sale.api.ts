import { kioscoApi } from "@/lib/kioscoApi";
import type { CreateSaleDto, Sale } from "@/lib/types/sale";

const SALE_BASE_PATH = "/sale";

export const saleApi = {
  listByShop: async (shopId: string): Promise<Sale[] | { data: Sale[] }> => {
    const { data } = await kioscoApi.get(SALE_BASE_PATH, {
      params: { shopId },
    });
    return data;
  },
  create: async (payload: CreateSaleDto): Promise<Sale> => {
    const { data } = await kioscoApi.post(SALE_BASE_PATH, payload);
    return (data as any)?.data ?? data;
  },
};
