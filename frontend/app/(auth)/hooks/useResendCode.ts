import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { resendVerificationCodeAction } from "../actions/resendVerificationCodeAction";
import { toApiError } from "@/lib/error-handler";

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
    onError: (error: unknown) => {
      const apiError = toApiError(error);
      const statusCode = apiError.statusCode ?? apiError.response?.status;
      let errorTitle = "Error al enviar código";
      let errorMessage =
        apiError.message ||
        "No se pudo enviar el código. Por favor intenta de nuevo.";

      switch (statusCode) {
        case 404:
          errorTitle = "Usuario no encontrado";
          errorMessage =
            apiError.message ||
            "No se encontró una cuenta con este email.";
          break;
        case 409:
          errorTitle = "Ya verificado";
          errorMessage =
            apiError.message ||
            "Esta cuenta ya ha sido verificada. Puedes iniciar sesión.";
          break;
        case 429:
          errorTitle = "Demasiadas solicitudes";
          errorMessage =
            apiError.message ||
            "Has solicitado demasiados códigos. Espera unos minutos antes de intentar nuevamente.";
          break;
        case 500:
          errorTitle = "Error del servidor";
          errorMessage =
            "Ocurrió un error en el servidor. Por favor intenta más tarde.";
          break;
        default:
          errorMessage = apiError.message || errorMessage;
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
