import { authApi } from "@/lib/authApi";
import { LoginResponse } from "../types";

export const loginActions = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  console.log({ email, password });

  try {
    const { data } = await authApi.post<LoginResponse>("/auth/login", {
      email,
      password,
    });
    console.log(data);

    if (!data?.token || !data?.user) {
      throw new Error("Respuesta de login inválida: faltan datos de sesión.");
    }

    return data;
  } catch (error) {
    throw error;
  }
};
