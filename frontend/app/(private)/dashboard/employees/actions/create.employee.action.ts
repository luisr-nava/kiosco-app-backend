import { kioscoApi } from "@/lib/kioscoApi";
import { CreateEmployeeDto, Employee } from "../interfaces";
import { unwrapResponse } from "@/lib/api/utils";

export const createEmployeeAction = async (
  payload: CreateEmployeeDto,
): Promise<Employee> => {
  const { data } = await kioscoApi.post<Employee | { data: Employee }>(
    "/employee",
    payload,
  );
  return unwrapResponse(data);
};
