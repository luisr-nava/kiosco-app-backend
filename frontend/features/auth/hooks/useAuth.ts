import { useAuthStore } from "../auth.slice";

export const useAuth = () => {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const isLoading = useAuthStore((state) => state.isLoading);
  const plan = useAuthStore((state) => state.plan);
  const isAuthenticated = Boolean(token);

  return {
    user,
    token,
    isLoading,
    plan,
    isAuthenticated,
  };
};
