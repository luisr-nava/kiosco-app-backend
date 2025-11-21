import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { kioscoApi } from "@/lib/kioscoApi";
import { useAuthStore } from "../store/slices/auth.slice";
import { useShopStore } from "@/app/(private)/store/shops.slice";

export const useLogout = () => {
  const router = useRouter();
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const clearShops = useShopStore((state) => state.clearShops);

  const mutation = useMutation({
    mutationFn: async () => {
      // Llamar al endpoint de logout del backend (opcional)
      try {
        await kioscoApi.post("/auth-client/logout");
      } catch (error) {
        // Continuar con logout local incluso si falla el backend
        console.error("Error al hacer logout en el backend:", error);
      }
    },
    onSuccess: () => {
      // Limpiar estado de autenticación y tiendas
      clearAuth();
      clearShops();

      // Toast de éxito
      toast.success("Sesión cerrada", {
        description: "Has cerrado sesión correctamente",
      });

      console.log("Logout exitoso");

      // Redirigir al login
      router.push("/login");
    },
    onError: (error: any) => {
      console.error("Error en logout:", error);

      // Toast de advertencia (logout de todos modos)
      toast.warning("Sesión cerrada localmente", {
        description:
          "No se pudo contactar con el servidor, pero la sesión se cerró localmente.",
      });

      // Limpiar de todos modos
      clearAuth();
      clearShops();
      router.push("/login");
    },
  });

  return {
    logout: mutation.mutate,
    isLoading: mutation.isPending,
    error: mutation.error,
    isError: mutation.isError,
  };
}
