import { authApi } from "@/lib/authApi";

interface ForgotPasswordResponse {
  message: string;
}

export const forgotPasswordAction = async (email: string): Promise<ForgotPasswordResponse> => {
  const project = process.env.NEXT_PUBLIC_PROJECT;
  try {
    const { data } = await authApi.post<ForgotPasswordResponse>("/auth/forgot-password", { email });
    return data;
  } catch (error) {
    throw error;
  }
};
