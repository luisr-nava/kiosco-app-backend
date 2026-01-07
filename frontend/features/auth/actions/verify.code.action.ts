import { authApi } from "@/lib/authApi";

interface VerifyCodeResponse {
  message: string;
}

export const verifyCodeAction = async (code: string): Promise<VerifyCodeResponse> => {
  try {
    const { data } = await authApi.post<VerifyCodeResponse>("/auth/verify-code", { code });
    return data;
  } catch (error) {
    throw error;
  }
};
