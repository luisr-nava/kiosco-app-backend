import { CreateEmployeeDto, Employee, EmployeeAuth } from "../types";
import { authApi } from "@/lib/authApi";

export const createAuthUserAction = async (
  payload: CreateEmployeeDto
): Promise<EmployeeAuth> => {
  const { data } = await authApi.post<EmployeeAuth>("/auth/employee", payload);
  return data;
};
