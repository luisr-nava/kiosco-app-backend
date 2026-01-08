import { ForgotPasswordForm } from "@/features/auth/components";

export default function ForgotPassword() {
  return (
    <div className="grid w-full justify-center">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-3xl font-bold">Recuperar Contraseña</h1>
        <p className="text-muted-foreground">
          Ingresa tu email y te enviaremos un enlace para restablecer tu
          contraseña
        </p>
      </div>
      <ForgotPasswordForm />
    </div>
  );
}
