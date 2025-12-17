import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { resetPasswordAction } from "../actions/resetPasswordAction";
import { toApiError } from "@/lib/error-handler";

export const useResetPassword = () => {
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: async ({
      token,
      newPassword,
    }: {
      token: string;
      newPassword: string;
    }) => {
      return await resetPasswordAction({ token, newPassword });
    },
    onSuccess: (data) => {
      // Toast de éxito
      toast.success("¡Contraseña restablecida!", {
        description:
          "Tu contraseña ha sido actualizada correctamente. Ahora puedes iniciar sesión con tu nueva contraseña.",
        duration: 5000,
      });

      // Redirigir al login
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    },
    onError: (error: unknown) => {
      console.error("Error en reset password:", error);

      const apiError = toApiError(error);
      const statusCode = apiError.statusCode ?? apiError.response?.status;
      let errorTitle = "Error al restablecer contraseña";
      let errorMessage =
        apiError.message ||
        "No se pudo restablecer la contraseña. Por favor intenta de nuevo.";

      switch (statusCode) {
        case 400:
          errorTitle = "Token inválido o expirado";
          errorMessage =
            apiError.message ||
            "El enlace de recuperación es inválido o ha expirado. Por favor solicita un nuevo enlace.";
          break;
        case 404:
          errorTitle = "Usuario no encontrado";
          errorMessage =
            apiError.message ||
            "No se encontró el usuario asociado a este token.";
          break;
        case 422:
          errorTitle = "Contraseña inválida";
          errorMessage =
            apiError.message ||
            "La contraseña debe tener al menos 6 caracteres.";
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
    resetPassword: mutation.mutate,
    isLoading: mutation.isPending,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    data: mutation.data,
    reset: mutation.reset,
  };
};
