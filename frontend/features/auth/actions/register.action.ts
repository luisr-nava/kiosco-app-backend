import { authApi } from "@/lib/authApi";
import { RegisterFormData, RegisterResponse } from "../types";

export const registerAction = async (
  payload: RegisterFormData
): Promise<RegisterResponse> => {
  try {
    const { data } = await authApi.post<RegisterResponse>("/auth/register", {
      ...payload,
    });
    return data;
  } catch (error) {
    throw error;
  }
};
