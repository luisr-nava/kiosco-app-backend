import { kioscoApi } from "@/lib/kioscoApi";
import type { Supplier } from "@/lib/types/supplier";
import { unwrapResponse } from "./utils";

const SUPPLIER_BASE_PATH = "/supplier";

export const supplierApi = {
  listByShop: async (
    shopId: string,
  ): Promise<Supplier[]> => {
    const { data } = await kioscoApi.get<Supplier[] | { data: Supplier[] }>(
      SUPPLIER_BASE_PATH,
      {
        params: { shopId },
      },
    );
    return unwrapResponse(data);
  },
};
