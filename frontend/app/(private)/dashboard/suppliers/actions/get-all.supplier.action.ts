import { kioscoApi } from "@/lib/kioscoApi";
import type { Supplier } from "@/lib/types/supplier";
import { unwrapResponse } from "@/lib/api/utils";

export const getSuppliersAction = async (shopId: string): Promise<Supplier[]> => {
  const { data } = await kioscoApi.get<Supplier[] | { data: Supplier[] }>("/supplier", {
    params: { shopId },
  });
  return unwrapResponse(data);
};
