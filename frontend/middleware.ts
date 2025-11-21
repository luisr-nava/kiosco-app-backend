import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const pathname = request.nextUrl.pathname;

  // Rutas de autenticación (login, register, forgot-password, etc.)
  const authRoutes = [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/verify-account",
  ];

  // Rutas privadas que requieren autenticación
  const privateRoutes = ["/dashboard"];

  // Rutas públicas que no requieren protección
  const publicRoutes = ["/", "/pricing", "/terms", "/privacy"];

  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));
  const isPrivateRoute = privateRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isPublicRoute = publicRoutes.includes(pathname);

  // Si el usuario está autenticado y intenta acceder a rutas de auth
  if (token && isAuthRoute) {
    // Redirigir al dashboard
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Si el usuario NO está autenticado y intenta acceder a rutas privadas
  if (!token && isPrivateRoute) {
    // Redirigir al login
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Permitir acceso a rutas públicas y otras rutas
  return NextResponse.next();
}

// Configurar qué rutas deben pasar por el middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
