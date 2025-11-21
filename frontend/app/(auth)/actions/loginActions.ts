import { kioscoApi } from "@/lib/kioscoApi";
import { LoginResponse } from "../interfaces";
import { AxiosError } from "axios";

export const loginActions = async (
  email: string,
  password: string,
): Promise<LoginResponse> => {
  try {
    const { data } = await kioscoApi.post<LoginResponse>("/auth-client/login", {
      email,
      password,
    });
    return data;
  } catch (error) {
    console.error("Error en loginActions:", error);

    // Mejorar el mensaje de error para que sea más específico
    if (error instanceof AxiosError) {
      const message = error.response?.data?.message || error.message;
      const statusCode = error.response?.status;

      // Crear un error más descriptivo
      const enhancedError = new Error(message);
      (enhancedError as any).statusCode = statusCode;
      (enhancedError as any).response = error.response;

      throw enhancedError;
    }

    throw error;
  }
};


