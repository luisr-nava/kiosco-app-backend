import { useMutation } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { loginActions } from "../actions/loginActions";
import { LoginResponse } from "../interfaces";
import { useAuthStore } from "../store/slices/auth.slice";
import { getAuthErrorMessage } from "@/lib/error-handler";

export const useLogin = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((state) => state.setAuth);
  const redirectTo = searchParams.get("redirect") || "/dashboard";

  const mutation = useMutation({
    mutationFn: async ({
      email,
      password,
    }: {
      email: string;
      password: string;
    }) => {
      return await loginActions(email, password);
    },
    onSuccess: (data: LoginResponse) => {
      // Guardar en Zustand store (también guarda en cookies)
      setAuth({
        user: data.user,
        token: data.token,
        refreshToken: data.refreshToken,
        projectId: data.projectId,
      });

      // Toast de éxito
      toast.success("¡Bienvenido!", {
        description: `Inicio de sesión exitoso. Hola, ${data.user.fullName}`,
      });

      console.log("Login exitoso:", data.user);

      // Redirigir al dashboard
      router.push(redirectTo);
    },
    onError: (error: unknown) => {
      console.error("Error en login:", error);

      // Obtener mensaje de error usando el helper centralizado
      const { title, message } = getAuthErrorMessage(error);

      toast.error(title, {
        description: message,
        duration: 5000,
      });
    },
  });

  return {
    login: mutation.mutate,
    isLoading: mutation.isPending,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    data: mutation.data,
    reset: mutation.reset,
  };
};
