import { VerifyAccountForm } from "@/features/auth/components";

export default function VerifyAccountPage() {
  return (
    <div className="grid w-full justify-center">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-3xl font-bold">Verificar Cuenta</h1>
        <p className="text-muted-foreground">
          Ingresa el código de 6 dígitos que enviamos a tu email
        </p>
      </div>
      <VerifyAccountForm />
    </div>
  );
}
