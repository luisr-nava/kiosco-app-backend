import { kioscoApi } from "@/lib/kioscoApi";
import type { CreatePurchaseDto, Purchase } from "@/lib/types/purchase";
import { unwrapResponse } from "./utils";

const PURCHASE_BASE_PATH = "/purchase";

export const purchaseApi = {
  listAll: async (): Promise<Purchase[]> => {
    const { data } = await kioscoApi.get<Purchase[] | { data: Purchase[] }>(
      PURCHASE_BASE_PATH,
    );
    return unwrapResponse(data);
  },
  listByShop: async (
    shopId: string,
  ): Promise<Purchase[]> => {
    const { data } = await kioscoApi.get<Purchase[] | { data: Purchase[] }>(
      PURCHASE_BASE_PATH,
      {
      params: { shopId },
      },
    );
    return unwrapResponse(data);
  },
  create: async (payload: CreatePurchaseDto): Promise<Purchase> => {
    const { data } = await kioscoApi.post<Purchase | { data: Purchase }>(
      PURCHASE_BASE_PATH,
      payload,
    );
    return unwrapResponse(data);
  },
};
