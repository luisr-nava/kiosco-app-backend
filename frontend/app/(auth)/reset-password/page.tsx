"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useRouter } from "next/router";
import { ResetPasswordForm } from "@/features/auth/components";

export default function ResetPassword() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();

  if (!token) return router.push("/forgot-password");

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
          <h1 className="mb-2 text-3xl font-bold">Restablecer Contraseña</h1>
          <p className="text-muted-foreground">Ingresa tu nueva contraseña para tu cuenta</p>
        </div>
        <ResetPasswordForm token={token} />
      </div>
    </Suspense>
  );
}
