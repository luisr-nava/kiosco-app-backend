import { kioscoApi } from "@/lib/kioscoApi";
import { AxiosError } from "axios";

interface ResetPasswordPayload {
  token: string;
  newPassword: string;
}

interface ResetPasswordResponse {
  message: string;
}

export const resetPasswordAction = async (
  payload: ResetPasswordPayload,
): Promise<ResetPasswordResponse> => {
  try {
    const { data } = await kioscoApi.post<ResetPasswordResponse>(
      "/auth-client/reset-password",
      payload,
    );
    return data;
  } catch (error) {
    console.error("Error en resetPasswordAction:", error);

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
