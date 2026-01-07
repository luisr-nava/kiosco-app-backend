import { kioscoApi } from "@/lib/kioscoApi";
import { CreateSupplierDto, Supplier } from "../types";

export const createSupplierAction = async (payload: CreateSupplierDto): Promise<Supplier> => {
  const { data } = await kioscoApi.post<Supplier>("/supplier", payload);
  return data;
};
