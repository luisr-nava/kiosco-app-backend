import { LoginForm } from "@/features/auth/components";
import Link from "next/link";
import { Suspense } from "react";

export default function Login() {
  return (
    <Suspense
      fallback={
        <div className="grid w-full justify-center">
          <p>Cargando...</p>
        </div>
      }
    >
      <div className="grid w-full justify-center">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold">Iniciar Sesión</h1>
          <p className="text-muted-foreground">Ingresa a tu cuenta</p>
        </div>
        <LoginForm />
        <p className="text-muted-foreground mt-6 text-center text-sm">
          ¿No tienes una cuenta?{" "}
          <Link
            href="/register"
            className="text-primary hover:text-primary/80 font-medium transition-all duration-300"
          >
            Registrarse
          </Link>
        </p>
      </div>
    </Suspense>
  );
}
