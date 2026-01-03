import { kioscoApi } from "@/lib/kioscoApi";
import { CreateEmployeeDto, Employee } from "../types";
import { unwrapResponse } from "@/lib/api/utils";

export const updateEmployeeAction = async (
  id: string,
  payload: Partial<CreateEmployeeDto>,
): Promise<Employee> => {
  const { data } = await kioscoApi.patch<Employee | { data: Employee }>(
    `/employees/${id}`,
    payload,
  );
  return unwrapResponse(data);
};

