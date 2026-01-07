import { authApi } from "@/lib/authApi";

export const logoutActions = async (): Promise<void> => {
  try {
    await authApi.post("/auth/logout");
  } catch (error) {
    throw error;
  }
};
