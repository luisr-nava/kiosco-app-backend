"use client";

import { useEffect } from "react";
import { useAuthStore } from "../store/slices/auth.slice";

/**
 * AuthProvider - Componente que hidrata el estado de autenticación
 * Se ejecuta una vez al cargar la aplicación para verificar si hay sesión activa
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const hydrate = useAuthStore((state) => state.hydrate);

  useEffect(() => {
    // Hidratar estado desde cookies al montar la app
    hydrate();
  }, [hydrate]);

  return <>{children}</>;
}
