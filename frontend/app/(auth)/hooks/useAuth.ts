import { useAuthStore } from "../store/slices/auth.slice";

/**
 * Hook para acceder al estado de autenticación
 * Proporciona una interfaz limpia para acceder al usuario y estado de auth
 */
export const useAuth = () => {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const projectId = useAuthStore((state) => state.projectId);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const setProjectId = useAuthStore((state) => state.setProjectId);

  return {
    user,
    token,
    projectId,
    isAuthenticated,
    isLoading,
    setProjectId,
  };
};
