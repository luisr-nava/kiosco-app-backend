import { toast } from "sonner";
import { useResendCodeMutation } from "./useAuthMutations";
import { useState } from "react";

export const useResendCode = ({ email }: { email: string }) => {
  const { mutate, isPending } = useResendCodeMutation();
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const handleResendCode = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!showEmailInput) {
      setShowEmailInput(true);
      return;
    }

    if (!email) {
      return;
    }
    mutate(
      { email },
      {
        onSuccess: () => {
          toast.success("Código enviado", {
            description:
              "Te hemos enviado un nuevo código de verificación. Revisa tu email.",
            duration: 5000,
          });
        },
        onError: () => {
          toast.error("Error al enviar código", {
            description:
              "No se pudo enviar el código. Por favor intenta de nuevo.",
            duration: 5000,
          });
        },
      }
    );

    setCooldown(60);
    const interval = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return {
    cooldown,
    handleResendCode,
    isLoading: isPending,
  };
};
