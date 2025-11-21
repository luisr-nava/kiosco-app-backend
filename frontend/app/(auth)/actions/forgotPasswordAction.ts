import { kioscoApi } from "@/lib/kioscoApi";
import { AxiosError } from "axios";

interface ForgotPasswordResponse {
  message: string;
}

export const forgotPasswordAction = async (
  email: string,
): Promise<ForgotPasswordResponse> => {
  try {
    const { data } = await kioscoApi.post<ForgotPasswordResponse>(
      "/auth-client/forgot-password",
      { email },
    );
    return data;
  } catch (error) {
    console.error("Error en forgotPasswordAction:", error);

    // Mejorar el mensaje de error
    if (error instanceof AxiosError) {
      const message = error.response?.data?.message || error.message;
      const statusCode = error.response?.status;

      const enhancedError = new Error(message);
      (enhancedError as any).statusCode = statusCode;
      (enhancedError as any).response = error.response;

      throw enhancedError;
    }

    throw error;
  }
};
