import { authApi } from "@/lib/authApi";

interface ResetPasswordPayload {
  token: string;
  newPassword: string;
}

interface ResetPasswordResponse {
  message: string;
}

export const resetPasswordAction = async (
  payload: ResetPasswordPayload
): Promise<ResetPasswordResponse> => {
  try {
    const { data } = await authApi.post<ResetPasswordResponse>(
      "/auth/reset-password",
      {
        ...payload,
      }
    );
    return data;
  } catch (error) {
    throw error;
  }
};
