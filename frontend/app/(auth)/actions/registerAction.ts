import { kioscoApi } from "@/lib/kioscoApi";
import { RegisterResponse } from "../interfaces";
import { AxiosError } from "axios";

interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
  projectId: string;
}

export const registerAction = async (
  payload: RegisterPayload,
): Promise<RegisterResponse> => {
  try {
    const { data } = await kioscoApi.post<RegisterResponse>(
      "/auth-client/register",
      payload,
    );
    return data;
  } catch (error) {
    console.error("Error en registerAction:", error);

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


