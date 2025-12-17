import { kioscoApi } from "@/lib/kioscoApi";
import { AxiosError } from "axios";
import { toApiError } from "@/lib/error-handler";
import type { ApiError } from "@/lib/error-handler";

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

    if (error instanceof AxiosError) {
      throw toApiError(error);
    }

    const fallbackError: ApiError = Object.assign(
      new Error("No se pudo restablecer la contraseña."),
      { statusCode: 500 },
    );

    throw error instanceof Error ? error : fallbackError;
  }
};
