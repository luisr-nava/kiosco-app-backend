"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/hooks";

const PUBLIC_STATIC_PATHS = new Set(["/", "/pricing", "/privacy", "/terms"]);
const PUBLIC_PREFIXES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-account",
];

const isPublicRoute = (pathname: string) => {
  if (PUBLIC_STATIC_PATHS.has(pathname)) {
    return true;
  }

  return PUBLIC_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
};

interface PublicRouteGuardProps {
  children: ReactNode;
}

export function PublicRouteGuard({ children }: PublicRouteGuardProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  const shouldRedirect = isPublicRoute(pathname) && isAuthenticated && !isLoading;

  useEffect(() => {
    if (shouldRedirect) {
      router.replace("/dashboard");
    }
  }, [shouldRedirect, router]);

  if (shouldRedirect) {
    return null;
  }

  return <>{children}</>;
}
