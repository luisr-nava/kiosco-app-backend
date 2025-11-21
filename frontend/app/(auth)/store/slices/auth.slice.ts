import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import Cookies from "js-cookie";
import { AuthState, User } from "../types/auth.entity";

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      user: null,
      token: null,
      refreshToken: null,
      projectId: null,
      isAuthenticated: false,
      isLoading: true,

      // Guardar datos de autenticación
      setAuth: (data) => {
        // Guardar en cookies
        Cookies.set("token", data.token, { expires: 7 }); // 7 días
        if (data.refreshToken) {
          Cookies.set("refreshToken", data.refreshToken, { expires: 30 }); // 30 días
        }
        Cookies.set("projectId", data.projectId, { expires: 7 });

        // Actualizar estado
        set({
          user: data.user,
          token: data.token,
          refreshToken: data.refreshToken || null,
          projectId: data.projectId,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      // Actualizar solo el usuario
      setUser: (user) => {
        set({ user });
      },

      // Actualizar tienda/proyecto activo
      setProjectId: (projectId) => {
        Cookies.set("projectId", projectId, { expires: 7 });
        set({ projectId });
      },

      // Limpiar autenticación (logout)
      clearAuth: () => {
        // Limpiar cookies
        Cookies.remove("token");
        Cookies.remove("refreshToken");
        Cookies.remove("projectId");

        // Resetear estado
        set({
          user: null,
          token: null,
          refreshToken: null,
          projectId: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      // Verificar si hay autenticación válida
      checkAuth: () => {
        const token = Cookies.get("token");
        const projectId = Cookies.get("projectId");

        if (token && projectId) {
          set({
            token,
            projectId,
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          get().clearAuth();
        }
      },

      // Hidratar estado desde cookies (al cargar la app)
      hydrate: () => {
        const token = Cookies.get("token");
        const refreshToken = Cookies.get("refreshToken");
        const projectId = Cookies.get("projectId");

        if (token && projectId) {
          set({
            token,
            refreshToken: refreshToken || null,
            projectId,
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          set({
            isLoading: false,
            isAuthenticated: false,
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
        projectId: state.projectId,
      }),
    },
  ),
);
