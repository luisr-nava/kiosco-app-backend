import { toast } from "sonner";
import { useForgotPasswordMutation } from "./useAuthMutations";
import { ForgotPasswordFormData } from "../types";

export const useForgotPassword = () => {
  const { mutate, isPending } = useForgotPasswordMutation();

  const onSubmit = (data: ForgotPasswordFormData) => {
    mutate(
      { email: data.email },
      {
        onSuccess: () => {
          toast.success("Email enviado", {
            description:
              "Te enviamos instrucciones para restablecer tu contraseña.",
          });
        },
        onError: () => {
          toast.error("Error al enviar email", {
            description:
              "No se pudo enviar el email de recuperación. Intenta nuevamente.",
          });
        },
      }
    );
  };

  return {
    onSubmit,
    isLoading: isPending,
  };
};
