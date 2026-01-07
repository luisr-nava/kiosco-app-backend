import { useAuth } from "./useAuth";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function usePrivateRouteGuard() {
  const { isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  return {
    isLoading,
    isAuthenticated,
  };
}
