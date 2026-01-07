import { kioscoApi } from "@/lib/kioscoApi";
import type { DeleteCustomerResponse } from "../interfaces";

export const deleteCustomerAction = async (id: string): Promise<DeleteCustomerResponse> => {
  const { data } = await kioscoApi.delete<DeleteCustomerResponse>(`/customer/${id}`);

  return data;
};
