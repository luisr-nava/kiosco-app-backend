import { authApi } from "@/lib/authApi";

interface ResendCodeResponse {
  message: string;
}

export const resendVerificationCodeAction = async (
  email: string
): Promise<ResendCodeResponse> => {
  try {
    const { data } = await authApi.post<ResendCodeResponse>(
      "/auth/resend-verification-code",

      { email }
    );
    return data;
  } catch (error) {
    throw error;
  }
};
