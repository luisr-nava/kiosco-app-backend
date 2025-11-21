import React from "react";
import RegisterForm from "../components/register-form";
import Link from "next/link";

export default function Register() {
  return (
    <div className="w-full grid justify-center">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Registrate</h1>
        <p className="text-muted-foreground">Crea un cuenta</p>
      </div>
      <RegisterForm />
      <p className="text-center text-sm text-muted-foreground mt-6">
        ¿Tienes una cuenta?{" "}
        <Link
          href="/login"
          className="text-violet-800 hover:text-violet-900 transition-all duration-300 font-medium">
          Iniciar Sesión
        </Link>
      </p>
    </div>
  );
}




