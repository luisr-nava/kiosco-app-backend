import { kioscoApi } from "@/lib/kioscoApi";
import { AxiosError } from "axios";

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
