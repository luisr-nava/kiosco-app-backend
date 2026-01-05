import { kioscoApi } from "@/lib/kioscoApi";
import { CreateSupplierDto, Supplier } from "../types";

export const updateSupplierAction = async (
  id: string,
  payload: Partial<CreateSupplierDto>,
): Promise<Supplier> => {
  const { data } = await kioscoApi.patch<Supplier>(`/supplier/${id}`, payload);
  return data;
};

