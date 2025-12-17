import { kioscoApi } from "@/lib/kioscoApi";
import { AxiosError } from "axios";
import { toApiError } from "@/lib/error-handler";
import type { ApiError } from "@/lib/error-handler";

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

    if (error instanceof AxiosError) {
      throw toApiError(error);
    }

    const fallbackError: ApiError = Object.assign(
      new Error("No se pudo enviar el email de recuperación."),
      { statusCode: 500 },
    );

    throw error instanceof Error ? error : fallbackError;
  }
};
