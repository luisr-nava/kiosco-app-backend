import { kioscoApi } from "@/lib/kioscoApi";
import { CreateEmployeeDto, Employee } from "../types";

export const updateEmployeeAction = async (
  id: string,
  payload: Partial<CreateEmployeeDto>,
): Promise<Employee> => {
  const { data } = await kioscoApi.patch<Employee>(`/employees/${id}`, payload);
  return data;
};

