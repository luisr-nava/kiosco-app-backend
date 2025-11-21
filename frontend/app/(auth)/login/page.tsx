import Link from "next/link";
import LoginForm from "../components/login-form";
import { Suspense } from "react";

function LoginContent() {
  return (
    <div className="w-full grid justify-center">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Iniciar Sesión</h1>
        <p className="text-muted-foreground">Ingresa a tu cuenta</p>
      </div>
      <LoginForm />
      <p className="text-center text-sm text-muted-foreground mt-6">
        ¿No tienes una cuenta?{" "}
        <Link
          href="/register"
          className="text-violet-800 hover:text-violet-900 transition-all duration-300 font-medium">
          Registrarse
        </Link>
      </p>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense fallback={<div className="w-full grid justify-center"><p>Cargando...</p></div>}>
      <LoginContent />
    </Suspense>
  );
}


