import { kioscoApi } from "@/lib/kioscoApi";
import { AxiosError } from "axios";
import { toApiError } from "@/lib/error-handler";
import type { ApiError } from "@/lib/error-handler";

interface ResendCodeResponse {
  message: string;
}

export const resendVerificationCodeAction = async (
  email: string,
): Promise<ResendCodeResponse> => {
  try {
    const { data } = await kioscoApi.post<ResendCodeResponse>(
      "/auth-client/resend-verification-code",
      { email },
    );
    return data;
  } catch (error) {
    console.error("Error en resendVerificationCodeAction:", error);

    if (error instanceof AxiosError) {
      throw toApiError(error);
    }

    const fallbackError: ApiError = Object.assign(
      new Error("No se pudo reenviar el código de verificación."),
      { statusCode: 500 },
    );

    throw error instanceof Error ? error : fallbackError;
  }
};
