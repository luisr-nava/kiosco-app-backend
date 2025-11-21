import { kioscoApi } from "@/lib/kioscoApi";
import type { Supplier } from "@/lib/types/supplier";

const SUPPLIER_BASE_PATH = "/supplier";

export const supplierApi = {
  listByShop: async (
    shopId: string,
  ): Promise<Supplier[] | { data: Supplier[] }> => {
    const { data } = await kioscoApi.get(SUPPLIER_BASE_PATH, {
      params: { shopId },
    });
    return data;
  },
};
