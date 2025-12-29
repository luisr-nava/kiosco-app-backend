import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { authApi } from "@/lib/authApi";
import { useAuthStore } from "../store/slices/auth.slice";
import { useShopStore } from "@/app/(private)/store/shops.slice";
import { useNotificationsStore } from "@/app/(private)/store/notifications.slice";
import { useQueryClient } from "@tanstack/react-query";
import { myShopsQueryKey } from "@/app/(private)/hooks/useMyShops";

export const useLogout = () => {
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const clearShops = useShopStore((state) => state.clearShops);
  const setNotifications = useNotificationsStore(
    (state) => state.setNotifications,
  );
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      // Llamar al endpoint de logout del backend (opcional)
      try {
        await authApi.post("/auth/logout");
      } catch (error) {
        // Continuar con logout local incluso si falla el backend
        console.error("Error al hacer logout en el backend:", error);
      }
    },
    onSuccess: () => {
      clearAuth();
      clearShops();
      setNotifications([]);
      queryClient.removeQueries({ queryKey: myShopsQueryKey, exact: true });

      toast.success("Sesión cerrada", {
        description: "Has cerrado sesión correctamente",
      });

      console.log("Logout exitoso");
    },
    onError: (error: unknown) => {
      console.error("Error en logout:", error);

      toast.warning("Sesión cerrada localmente", {
        description:
          "No se pudo contactar con el servidor, pero la sesión se cerró localmente.",
      });

      clearAuth();
      clearShops();
      setNotifications([]);
      queryClient.removeQueries({ queryKey: myShopsQueryKey, exact: true });
    },
  });

  return {
    logout: mutation.mutate,
    isLoading: mutation.isPending,
    error: mutation.error,
    isError: mutation.isError,
  };
};
