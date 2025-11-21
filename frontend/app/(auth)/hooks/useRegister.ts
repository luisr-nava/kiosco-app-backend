import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { registerAction } from "../actions/registerAction";
import { RegisterResponse } from "../interfaces";
import { getAuthErrorMessage } from "@/lib/error-handler";

export const useRegister = () => {
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: async ({
      fullName,
      email,
      password,
    }: {
      fullName: string;
      email: string;
      password: string;
    }) => {
      return await registerAction({ fullName, email, password });
    },
    onSuccess: (data: RegisterResponse) => {
      console.log("Registro exitoso:", data);

      // Toast de éxito
      toast.success("¡Cuenta creada exitosamente!", {
        description:
          "Te hemos enviado un código de verificación de 6 dígitos a tu email.",
        duration: 5000,
      });

      // Redirigir a verify-account
      // El backend envía el código de verificación automáticamente
      setTimeout(() => {
        router.push("/verify-account");
      }, 1500);
    },
    onError: (error: any) => {
      console.error("Error en registro:", error);

      // Obtener mensaje de error usando el helper centralizado
      const { title, message } = getAuthErrorMessage(error);

      toast.error(title, {
        description: message,
        duration: 5000,
      });
    },
  });

  return {
    register: mutation.mutate,
    isLoading: mutation.isPending,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    data: mutation.data,
    reset: mutation.reset,
  };
};
