import { useMutation, useQueryClient } from "@tanstack/react-query";
import { forgotPasswordAction } from "../actions/forgot.password.action";
import { loginActions } from "../actions/login.action";
import { logoutActions } from "../actions/logout.action";
import { RegisterFormData } from "../types";
import { registerAction } from "../actions/register.action";
import { resendVerificationCodeAction } from "../actions/resend.verification.code.action";
import { verifyCodeAction } from "../actions/verify.code.action";
import { resetPasswordAction } from "../actions/reset.password.action";

export const useForgotPasswordMutation = () => {
  return useMutation({
    mutationFn: async ({ email }: { email: string }) => {
      return forgotPasswordAction(email);
    },
  });
};

export const useLoginMutation = () => {
  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      return await loginActions(email, password);
    },
  });
};

export const useLogoutMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => logoutActions(),
  });
};

export const useRegisterMutation = () => {
  return useMutation({
    mutationFn: async ({ fullName, email, password }: RegisterFormData) => {
      return await registerAction({ fullName, email, password });
    },
  });
};

export const useResendCodeMutation = () => {
  return useMutation({
    mutationFn: async ({ email }: { email: string }) => {
      return await resendVerificationCodeAction(email);
    },
  });
};

export const useVerifyCodeMutation = () => {
  return useMutation({
    mutationFn: async (code: string) => {
      return await verifyCodeAction(code);
    },
  });
};

export const useResetPasswordMutation = () => {
  return useMutation({
    mutationFn: async ({ token, newPassword }: { token: string; newPassword: string }) => {
      return await resetPasswordAction({ token, newPassword });
    },
  });
};
