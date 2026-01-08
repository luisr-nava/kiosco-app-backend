import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { verifyCodeAction } from "../actions/verify.code.action";
import { useVerifyCodeMutation } from "./useAuthMutations";
import { KeyboardEvent, useRef, useState, ClipboardEvent } from "react";
const normalizeChar = (value: string) => {
  const matches = value.match(/[a-zA-Z0-9]/g);
  if (!matches || matches.length === 0) return "";
  return matches[matches.length - 1].toUpperCase();
};
export const useVerifyAccount = () => {
  const CODE_LENGTH = 8;
  const [error, setError] = useState<string>("");
  const router = useRouter();
  const [code, setCode] = useState<string[]>(
    Array.from({ length: CODE_LENGTH }, () => "")
  );
  const [showEmailInput, setShowEmailInput] = useState(false);
  const { mutate, isPending } = useVerifyCodeMutation();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const onSubmit = (code: string) => {
    if (code.length !== CODE_LENGTH) {
      setError(`El código debe tener ${CODE_LENGTH} caracteres`);
      return;
    }
    mutate(code, {
      onSuccess: () => {
        toast.success("¡Cuenta verificada!", {
          description:
            "Tu cuenta ha sido verificada correctamente. Ahora puedes iniciar sesión.",
          duration: 5000,
        });

        // Redirigir al login
        setTimeout(() => {
          router.push("/login");
        }, 1500);
      },
      onError: (error: unknown) => {
        let errorTitle = "Error en la verificación";
        let errorMessage =
          "No se pudo verificar tu cuenta. Por favor intenta de nuevo.";

        toast.error(errorTitle, {
          description: errorMessage,
          duration: 5000,
        });
      },
    });
  };
  const handlePaste = (index: number, e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");
    if (!pastedData) return;

    const digits = pastedData
      .split("")
      .map((char) => normalizeChar(char))
      .filter(Boolean)
      .slice(0, CODE_LENGTH);

    const newCode = [...code];

    digits.forEach((digit, offset) => {
      const targetIndex = index + offset;
      if (targetIndex < CODE_LENGTH) {
        newCode[targetIndex] = digit;
      }
    });

    setCode(newCode);
    setError("");

    const focusIndex = Math.min(index + digits.length, CODE_LENGTH - 1);
    inputRefs.current[focusIndex]?.focus();
  };
  const handleCodeChange = (index: number, value: string) => {
    const nextChar = normalizeChar(value);

    const newCode = [...code];
    newCode[index] = nextChar;
    setCode(newCode);
    setError("");

    // Auto-avanzar al siguiente input si se ingresó un dígito
    if (nextChar && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    // Retroceder al input anterior con Backspace
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };
  return {
    onSubmit,
    isPending,
    error,
    code,
    showEmailInput,
    inputRefs,
    handleCodeChange,
    handleKeyDown,
    handlePaste,
  };
};
