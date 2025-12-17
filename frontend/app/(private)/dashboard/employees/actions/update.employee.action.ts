import { kioscoApi } from "@/lib/kioscoApi";
import { CreateEmployeeDto, Employee } from "../interfaces";
import { unwrapResponse } from "@/lib/api/utils";

export const updateEmployeeAction = async (
  id: string,
  payload: Partial<CreateEmployeeDto>,
): Promise<Employee> => {
  const { data } = await kioscoApi.patch<Employee | { data: Employee }>(
    `/employee/${id}`,
    payload,
  );
  return unwrapResponse(data);
};
