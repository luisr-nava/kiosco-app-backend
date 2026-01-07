import { Supplier } from "@/features/suppliers/types";
import { kioscoApi } from "@/lib/kioscoApi";

const SUPPLIER_BASE_PATH = "/supplier";

export const supplierApi = {
  listByShop: async (shopId: string): Promise<Supplier[]> => {
    const { data } = await kioscoApi.get<Supplier[]>(SUPPLIER_BASE_PATH, {
      params: { shopId },
    });
    return data;
  },
};
