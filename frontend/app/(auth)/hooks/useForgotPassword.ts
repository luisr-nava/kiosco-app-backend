import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { forgotPasswordAction } from "../actions/forgotPasswordAction";
import { toApiError } from "@/lib/error-handler";

export const useForgotPassword = () => {
  const mutation = useMutation({
    mutationFn: async ({ email }: { email: string }) => {
      return await forgotPasswordAction(email);
    },
    onSuccess: (data) => {
      console.log("Solicitud de recuperación exitosa:", data);

      // Toast de éxito
      toast.success("Email enviado", {
        description:
          "Te hemos enviado un email con instrucciones para restablecer tu contraseña. Revisa tu bandeja de entrada.",
        duration: 6000,
      });
    },
    onError: (error: unknown) => {
      console.error("Error en forgot password:", error);

      const apiError = toApiError(error);
      const statusCode = apiError.statusCode ?? apiError.response?.status;
      let errorTitle = "Error al enviar email";
      let errorMessage =
        apiError.message ||
        "No se pudo enviar el email de recuperación. Por favor intenta de nuevo.";

      switch (statusCode) {
        case 404:
          errorTitle = "Email no encontrado";
          errorMessage =
            error?.message ||
            "No existe una cuenta con este email. Por favor verifica el email ingresado.";
          break;
        case 429:
          errorTitle = "Demasiadas solicitudes";
          errorMessage =
            error?.message ||
            "Has solicitado demasiados emails de recuperación. Espera unos minutos antes de intentar nuevamente.";
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
    sendResetEmail: mutation.mutate,
    isLoading: mutation.isPending,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    data: mutation.data,
    reset: mutation.reset,
  };
};
