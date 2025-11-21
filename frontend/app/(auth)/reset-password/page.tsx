"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import ResetPasswordForm from "../components/reset-password-form";
import Link from "next/link";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  if (!token) {
    return (
      <div className="w-full grid justify-center">
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No se encontró el token de recuperación. Por favor solicita un nuevo
            enlace de recuperación.
          </AlertDescription>
        </Alert>
        <div className="text-center">
          <Link
            href="/forgot-password"
            className="text-primary hover:underline">
            Solicitar nuevo enlace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full grid justify-center">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Restablecer Contraseña</h1>
        <p className="text-muted-foreground">
          Ingresa tu nueva contraseña para tu cuenta
        </p>
      </div>
      <ResetPasswordForm token={token} />
    </div>
  );
}

export default function ResetPassword() {
  return (
    <Suspense
      fallback={
        <div className="w-full grid justify-center">
          <p>Cargando...</p>
        </div>
      }>
      <ResetPasswordContent />
    </Suspense>
  );
}
