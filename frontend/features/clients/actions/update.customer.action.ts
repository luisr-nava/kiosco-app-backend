import { kioscoApi } from "@/lib/kioscoApi";
import type { CreateCustomerDto, Customer } from "../interfaces";

export const updateCustomerAction = async (
  id: string,
  payload: Partial<CreateCustomerDto>
): Promise<Customer> => {
  const { data } = await kioscoApi.patch<Customer>(`/customer/${id}`, payload);

  return data;
};
