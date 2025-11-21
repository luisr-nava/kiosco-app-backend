import ForgotPasswordForm from "../components/forgot-password-form";

export default function ForgotPassword() {
  return (
    <div className="w-full grid justify-center">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Recuperar Contraseña</h1>
        <p className="text-muted-foreground">
          Ingresa tu email y te enviaremos un enlace para restablecer tu
          contraseña
        </p>
      </div>
      <ForgotPasswordForm />
    </div>
  );
}
