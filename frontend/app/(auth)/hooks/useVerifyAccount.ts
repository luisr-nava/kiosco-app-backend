import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { verifyCodeAction } from "../actions/verifyCodeAction";

export const useVerifyAccount = () => {
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: async (code: string) => {
      return await verifyCodeAction(code);
    },
    onSuccess: (data) => {
      // Toast de éxito
      toast.success("¡Cuenta verificada!", {
        description:
          "Tu cuenta ha sido verificada correctamente. Ahora puedes iniciar sesión.",
        duration: 5000,
      });

      // Redirigir al login
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    },
    onError: (error: any) => {
      // Obtener mensaje de error
      const statusCode = error?.statusCode || error?.response?.status;
      let errorTitle = "Error en la verificación";
      let errorMessage =
        error?.message ||
        "No se pudo verificar tu cuenta. Por favor intenta de nuevo.";

      switch (statusCode) {
        case 400:
          errorTitle = "Código inválido";
          errorMessage =
            error?.message ||
            "El código ingresado es incorrecto. Por favor verifica e intenta nuevamente.";
          break;
        case 404:
          errorTitle = "Usuario no encontrado";
          errorMessage =
            error?.message ||
            "No se encontró una cuenta con este email.";
          break;
        case 410:
          errorTitle = "Código expirado";
          errorMessage =
            error?.message ||
            "El código ha expirado. Por favor solicita un nuevo código.";
          break;
        case 409:
          errorTitle = "Ya verificado";
          errorMessage =
            error?.message ||
            "Esta cuenta ya ha sido verificada. Puedes iniciar sesión.";
          break;
        case 429:
          errorTitle = "Demasiados intentos";
          errorMessage =
            error?.message ||
            "Has excedido el número de intentos permitidos. Espera unos minutos.";
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
    verifyAccount: mutation.mutate,
    isLoading: mutation.isPending,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    data: mutation.data,
    reset: mutation.reset,
  };
};
