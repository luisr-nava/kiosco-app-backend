import { NextRequest, NextResponse } from "next/server";
import { loginActions } from "@/features/auth/actions/login.action";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { message: "El email y la contraseña son obligatorios." },
        { status: 400 }
      );
    }

    const data = await loginActions(email, password);

    const response = NextResponse.json(data);
    response.cookies.set("token", data.token, {
      path: "/",
      maxAge: COOKIE_MAX_AGE,
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo iniciar sesión.";

    return NextResponse.json({ message }, { status: 401 });
  }
}
