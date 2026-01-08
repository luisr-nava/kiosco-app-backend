import { kioscoApi } from "@/lib/kioscoApi";
import type { CreatePurchaseDto, Purchase } from "@/lib/types/purchase";

const PURCHASE_BASE_PATH = "/purchase";

export const purchaseApi = {
  listAll: async (): Promise<Purchase[]> => {
    const { data } = await kioscoApi.get<Purchase[]>(PURCHASE_BASE_PATH);
    return data;
  },
  listByShop: async (shopId: string): Promise<Purchase[]> => {
    const { data } = await kioscoApi.get<Purchase[]>(PURCHASE_BASE_PATH, {
      params: { shopId },
    });
    return data;
  },
  create: async (payload: CreatePurchaseDto): Promise<Purchase> => {
    const { data } = await kioscoApi.post<Purchase>(
      PURCHASE_BASE_PATH,
      payload
    );
    return data;
  },
};
