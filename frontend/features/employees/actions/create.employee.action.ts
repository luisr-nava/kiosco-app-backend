import { kioscoApi } from "@/lib/kioscoApi";
import { CreateEmployeeDto, Employee } from "../types";

export const createEmployeeAction = async (payload: CreateEmployeeDto): Promise<Employee> => {
  const { data } = await kioscoApi.post<Employee>("/employees", payload);
  return data;
};
