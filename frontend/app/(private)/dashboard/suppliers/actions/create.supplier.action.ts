import { kioscoApi } from "@/lib/kioscoApi";
import type { CreateSupplierDto, Supplier } from "@/lib/types/supplier";
import { unwrapResponse } from "@/lib/api/utils";

export const createSupplierAction = async (
  payload: CreateSupplierDto,
): Promise<Supplier> => {
  const { data } = await kioscoApi.post<Supplier | { data: Supplier }>(
    "/supplier",
    payload,
  );
  return unwrapResponse(data);
};
