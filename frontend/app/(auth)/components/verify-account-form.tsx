"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, RefreshCw } from "lucide-react";
import { useRef, useState, KeyboardEvent, ClipboardEvent } from "react";
import { useForm } from "react-hook-form";
import { useVerifyAccount } from "../hooks/useVerifyAccount";
import { useResendCode } from "../hooks/useResendCode";

const CODE_LENGTH = 8;
const normalizeChar = (value: string) => {
  const matches = value.match(/[a-zA-Z0-9]/g);
  if (!matches || matches.length === 0) return "";
  return matches[matches.length - 1].toUpperCase();
};

interface VerifyAccountFormData {
  email?: string;
}

export default function VerifyAccountForm() {
  const { verifyAccount, isLoading: isVerifying } = useVerifyAccount();
  const { resendCode, isLoading: isResending } = useResendCode();
  const [cooldown, setCooldown] = useState(0);
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [code, setCode] = useState<string[]>(
    Array.from({ length: CODE_LENGTH }, () => ""),
  );
  const [error, setError] = useState<string>("");

  // Referencias para los inputs del código
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<VerifyAccountFormData>({
    defaultValues: {
      email: "",
    },
  });

  const email = watch("email");

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

  const onSubmit = () => {
    const fullCode = code.join("");

    if (fullCode.length !== CODE_LENGTH) {
      setError(`El código debe tener ${CODE_LENGTH} caracteres`);
      return;
    }

    verifyAccount(fullCode);
  };

  const handleResendCode = () => {
    if (!showEmailInput) {
      setShowEmailInput(true);
      return;
    }

    if (!email) {
      return;
    }

    resendCode({ email });

    // Cooldown de 60 segundos
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

  const isDisabled = isVerifying || isResending;

  return (
    <Card className="shadow-lg w-md">
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
          className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-center block">
                Código de Verificación
              </Label>

              {/* 8 inputs separados */}
              <div className="flex justify-center gap-2">
                {code.map((digit, index) => (
                  <Input
                    key={index}
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={(e) => handlePaste(index, e)}
                    disabled={isDisabled}
                    autoFocus={index === 0}
                    className="w-12 h-14 text-center text-2xl font-mono font-bold"
                  />
                ))}
              </div>

              {error && (
                <p className="text-sm text-destructive text-center">{error}</p>
              )}
              <p className="text-xs text-muted-foreground text-center">
                Ingresa el código de 8 caracteres (letras o números) que enviamos a tu email
              </p>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isDisabled}
            size="lg">
            {isVerifying ? "Verificando..." : "Verificar Cuenta"}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                ¿No recibiste el código?
              </span>
            </div>
          </div>

          {showEmailInput && (
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  className="pl-9"
                  {...register("email", {
                    required: showEmailInput ? "El email es requerido para reenviar" : false,
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Ingresa un email válido",
                    },
                  })}
                  disabled={isDisabled}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>
          )}

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleResendCode}
            disabled={isDisabled || cooldown > 0 || (showEmailInput && !email)}>
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isResending ? "animate-spin" : ""}`}
            />
            {cooldown > 0
              ? `Espera ${cooldown}s para reenviar`
              : isResending
                ? "Enviando..."
                : showEmailInput
                  ? "Enviar código"
                  : "Reenviar código"}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            <p>El código expira en 24 horas</p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
