import VerifyAccountForm from "../components/verify-account-form";

export default function VerifyAccountPage() {
  return (
    <div className="w-full grid justify-center">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Verificar Cuenta</h1>
        <p className="text-muted-foreground">
          Ingresa el código de 6 dígitos que enviamos a tu email
        </p>
      </div>
      <VerifyAccountForm />
    </div>
  );
}
