import { kioscoApi } from "@/lib/kioscoApi";
import { Employee } from "../interfaces";
import { unwrapResponse } from "@/lib/api/utils";

export const getEmployeesAction = async (shopId: string): Promise<Employee[]> => {
  const { data } = await kioscoApi.get<Employee[] | { data: Employee[] }>("/employee", {
    params: { shopId },
  });

  return unwrapResponse(data);
};
