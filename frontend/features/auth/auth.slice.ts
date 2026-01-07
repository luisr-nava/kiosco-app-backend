import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import Cookies from "js-cookie";
import { AuthState } from "./types";

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      user: null,
      token: null,
      plan: "",
      isLoading: true,
      subscriptionStatus: "",
      // Guardar datos de autenticación
      setAuth: (data) => {
        // Guardar en cookies
        Cookies.set("token", data.token, { expires: 7 }); // 7 días
        // Actualizar estado
        set({
          user: data.user,
          token: data.token,
          plan: data.plan,
          subscriptionStatus: data.subscriptionStatus,
          isLoading: false,
        });
      },

      // Actualizar solo el usuario
      setUser: (user) => {
        set({ user });
      },

      // Limpiar autenticación (logout)
      clearAuth: () => {
        // Limpiar cookies
        Cookies.remove("token");

        // Resetear estado
        set({
          user: null,
          token: null,
          plan: "",
          subscriptionStatus: "",
          isLoading: false,
        });
      },

      // Verificar si hay autenticación válida
      checkAuth: () => {
        const token = Cookies.get("token");

        if (token) {
          set({
            token,
            isLoading: false,
          });
        } else {
          get().clearAuth();
        }
      },

      // Hidratar estado desde cookies (al cargar la app)
      hydrate: () => {
        const token = Cookies.get("token");
        const plan = Cookies.get("plan");
        const subscriptionStatus = Cookies.get("subscriptionStatus");

        if (token) {
          set({
            token,
            plan: plan || "",
            subscriptionStatus: subscriptionStatus || "",
            isLoading: false,
          });
        } else {
          set({
            isLoading: false,
          });
        }
      },
    }),
    {
      name: "auth-storage", // nombre en localStorage
      storage: createJSONStorage(() => localStorage),
      // Solo persistir estos campos (no tokens por seguridad)
      partialize: (state) => ({
        user: state.user,
        plan: state.plan,
        subscriptionStatus: state.subscriptionStatus,
      }),
    }
  )
);
