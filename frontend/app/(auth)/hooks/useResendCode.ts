import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { resendVerificationCodeAction } from "../actions/resendVerificationCodeAction";

export const useResendCode = () => {
  const mutation = useMutation({
    mutationFn: async ({ email }: { email: string }) => {
      return await resendVerificationCodeAction(email);
    },
    onSuccess: (data) => {
      // Toast de éxito
      toast.success("Código enviado", {
        description:
          "Te hemos enviado un nuevo código de verificación. Revisa tu email.",
        duration: 5000,
      });
    },
    onError: (error: any) => {
      // Obtener mensaje de error
      const statusCode = error?.statusCode || error?.response?.status;
      let errorTitle = "Error al enviar código";
      let errorMessage =
        error?.message ||
        "No se pudo enviar el código. Por favor intenta de nuevo.";

      switch (statusCode) {
        case 404:
          errorTitle = "Usuario no encontrado";
          errorMessage =
            error?.message ||
            "No se encontró una cuenta con este email.";
          break;
        case 409:
          errorTitle = "Ya verificado";
          errorMessage =
            error?.message ||
            "Esta cuenta ya ha sido verificada. Puedes iniciar sesión.";
          break;
        case 429:
          errorTitle = "Demasiadas solicitudes";
          errorMessage =
            error?.message ||
            "Has solicitado demasiados códigos. Espera unos minutos antes de intentar nuevamente.";
          break;
        case 500:
          errorTitle = "Error del servidor";
          errorMessage =
            "Ocurrió un error en el servidor. Por favor intenta más tarde.";
          break;
        default:
          errorMessage = error?.message || errorMessage;
      }

      toast.error(errorTitle, {
        description: errorMessage,
        duration: 5000,
      });
    },
  });

  return {
    resendCode: mutation.mutate,
    isLoading: mutation.isPending,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    data: mutation.data,
    reset: mutation.reset,
  };
};
