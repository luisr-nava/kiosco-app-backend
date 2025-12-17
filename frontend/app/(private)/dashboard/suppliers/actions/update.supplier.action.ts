import { kioscoApi } from "@/lib/kioscoApi";
import type { CreateSupplierDto, Supplier } from "@/lib/types/supplier";
import { unwrapResponse } from "@/lib/api/utils";

export const updateSupplierAction = async (
  id: string,
  payload: Partial<CreateSupplierDto>,
): Promise<Supplier> => {
  const { data } = await kioscoApi.patch<Supplier | { data: Supplier }>(
    `/supplier/${id}`,
    payload,
  );
  return unwrapResponse(data);
};
