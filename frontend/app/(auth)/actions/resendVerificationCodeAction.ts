import { kioscoApi } from "@/lib/kioscoApi";
import { AxiosError } from "axios";

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
