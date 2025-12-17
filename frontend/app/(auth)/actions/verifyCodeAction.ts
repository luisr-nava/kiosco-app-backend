import { kioscoApi } from "@/lib/kioscoApi";
import { AxiosError } from "axios";
import { toApiError } from "@/lib/error-handler";
import type { ApiError } from "@/lib/error-handler";

interface VerifyCodeResponse {
  message: string;
}

export const verifyCodeAction = async (
  code: string,
): Promise<VerifyCodeResponse> => {
  try {
    const { data } = await kioscoApi.post<VerifyCodeResponse>(
      "/auth-client/verify-code",
      { code },
    );
    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw toApiError(error);
    }

    const fallbackError: ApiError = Object.assign(
      new Error("No se pudo verificar el código"),
      { statusCode: 500 },
    );

    throw error instanceof Error ? error : fallbackError;
  }
};
