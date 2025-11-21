import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export const useGoogleAuth = () => {
  const mutation = useMutation({
    mutationFn: async () => {
      // Toast de info
      toast.info("Redirigiendo a Google", {
        description: "Serás redirigido a Google para autenticarte",
      });

      // Pequeño delay para que el usuario vea el toast
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Redirigir a la URL de Google OAuth del backend
      const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "");
      window.location.href = `${backendUrl}/api/auth-client/google`;
    },
    onError: (error: any) => {
      console.error("Error en Google Auth:", error);

      // Toast de error
      toast.error("Error de autenticación", {
        description: "No se pudo iniciar la autenticación con Google",
      });
    },
  });

  return {
    signInWithGoogle: mutation.mutate,
    isLoading: mutation.isPending,
    error: mutation.error,
    isError: mutation.isError,
  };
};
