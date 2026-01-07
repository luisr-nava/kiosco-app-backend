import { toast } from "sonner";
import { useAuthStore } from "../auth.slice";
import { useLogoutMutation } from "./useAuthMutations";
import { useShopStore } from "@/features/shop/shop.store";

export const useLogout = () => {
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const setActiveShopId = useShopStore((state) => state.setActiveShopId);

  const { mutate, isPending } = useLogoutMutation();

  const handleLogout = () => {
    mutate(undefined, {
      onSuccess: () => {
        clearAuth();
        setActiveShopId(null);
        toast.success("Sesión cerrada", {
          description: "Has cerrado sesión correctamente",
        });
      },
      onError: () => {
        toast.warning("Sesión cerrada localmente", {
          description: "No se pudo contactar con el servidor, pero la sesión se cerró localmente.",
        });

        clearAuth();
      },
    });
  };

  return {
    logout: handleLogout,
    isLoading: isPending,
  };
};
