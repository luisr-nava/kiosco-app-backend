import { RegisterForm } from "@/features/auth/components";
import Link from "next/link";

export default function Register() {
  return (
    <div className="grid w-full justify-center">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-3xl font-bold">Registrate</h1>
        <p className="text-muted-foreground">Crea un cuenta</p>
      </div>
      <RegisterForm />
      <p className="text-muted-foreground mt-6 text-center text-sm">
        ¿Tienes una cuenta?{" "}
        <Link
          href="/login"
          className="text-primary hover:text-primary/80 font-medium transition-all duration-300"
        >
          Iniciar Sesión
        </Link>
      </p>
    </div>
  );
}
