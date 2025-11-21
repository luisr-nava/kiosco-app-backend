"use client";

import { useAuth } from "../hooks";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface AuthGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
}

/**
 * Componente que previene el acceso a rutas de auth si el usuario está autenticado
 */
export function AuthGuard({ children, redirectTo = "/dashboard" }: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Si el usuario está autenticado, redirigir
    if (!isLoading && isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  // Mostrar loading mientras verifica
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Cargando...</p>
      </div>
    );
  }

  // Si está autenticado, no mostrar nada (está redirigiendo)
  if (isAuthenticated) {
    return null;
  }

  // Si no está autenticado, mostrar el contenido
  return <>{children}</>;
}
