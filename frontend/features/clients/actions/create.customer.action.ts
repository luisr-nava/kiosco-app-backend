import { kioscoApi } from "@/lib/kioscoApi";
import type { CreateCustomerDto, Customer } from "../types";

export const createCustomerAction = async (
  payload: Partial<CreateCustomerDto>
): Promise<Customer> => {
  const { data } = await kioscoApi.post<Customer>("/customer", payload);
  return data;
};
