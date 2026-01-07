import { CreateEmployeeDto, Employee, EmployeeAuth } from "../types";
import { authApi } from "@/lib/authApi";

export const updateAuthUserAction = async (
  id: string,
  payload: Partial<CreateEmployeeDto>
): Promise<EmployeeAuth> => {
  const { data } = await authApi.patch<EmployeeAuth>(`/auth/employee/${id}`, payload);
  return data;
};
