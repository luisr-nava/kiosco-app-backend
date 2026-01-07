import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const authRoutes = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-account",
];

const privateRoutes = ["/dashboard"];

const publicRoutes = ["/", "/pricing", "/terms", "/privacy"];

const routeMatches = (pathname: string, routeList: string[]) =>
  routeList.some((route) => pathname.startsWith(route));

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const token = request.cookies.get("token")?.value;
  const isAuthenticated = Boolean(token);
  const isAuthRoute = routeMatches(pathname, authRoutes);
  const isPrivateRoute = routeMatches(pathname, privateRoutes);
  const isPublicRoute = publicRoutes.includes(pathname);

  if (!isAuthenticated && isPrivateRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAuthRoute) {
    // No redirect for auth routes to avoid redirect loops when cookies are not yet synced.
    return NextResponse.next();
  }

  if (isPublicRoute) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
