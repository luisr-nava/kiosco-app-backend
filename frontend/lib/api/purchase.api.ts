import { kioscoApi } from "@/lib/kioscoApi";
import type { CreatePurchaseDto, Purchase } from "@/lib/types/purchase";

const PURCHASE_BASE_PATH = "/purchase";

export const purchaseApi = {
  listByShop: async (
    shopId: string,
  ): Promise<Purchase[] | { data: Purchase[] }> => {
    const { data } = await kioscoApi.get(PURCHASE_BASE_PATH, {
      params: { shopId },
    });
    return data;
  },
  create: async (payload: CreatePurchaseDto): Promise<Purchase> => {
    const { data } = await kioscoApi.post(PURCHASE_BASE_PATH, payload);
    return (data as any)?.data ?? data;
  },
};
