import { kioscoApi } from "@/lib/kioscoApi";

export const deleteSupplierAction = async (id: string): Promise<void> => {
  await kioscoApi.delete(`/supplier/${id}`);
};
