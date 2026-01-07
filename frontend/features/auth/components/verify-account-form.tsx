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

interface VerifyAccountFormData {
  email?: string;
}

export default function VerifyAccountForm() {
  const {
    onSubmit,
    isPending: isVerifying,
    error,
    code,
    showEmailInput,
    inputRefs,
    handleCodeChange,
    handleKeyDown,
    handlePaste,
  } = useVerifyAccount();

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

  const {
    handleResendCode,
    isLoading: isResending,
    cooldown,
  } = useResendCode(email ? { email: email! } : { email: "" });

  const isDisabled = isVerifying || isResending;

  return (
    <Card className="w-md shadow-lg">
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(code.join(""));
          }}
          className="space-y-6"
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="block text-center">Código de Verificación</Label>

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
                    className="h-14 w-12 text-center font-mono text-2xl font-bold"
                  />
                ))}
              </div>

              {error && <p className="text-destructive text-center text-sm">{error}</p>}
              <p className="text-muted-foreground text-center text-xs">
                Ingresa el código de 8 caracteres (letras o números) que enviamos a tu email
              </p>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isDisabled} size="lg">
            {isVerifying ? "Verificando..." : "Verificar Cuenta"}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card text-muted-foreground px-2">¿No recibiste el código?</span>
            </div>
          </div>

          {showEmailInput && (
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
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
              {errors.email && <p className="text-destructive text-sm">{errors.email.message}</p>}
            </div>
          )}

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleResendCode}
            disabled={isDisabled || cooldown > 0 || (showEmailInput && !email)}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isResending ? "animate-spin" : ""}`} />
            {cooldown > 0
              ? `Espera ${cooldown}s para reenviar`
              : isResending
                ? "Enviando..."
                : showEmailInput
                  ? "Enviar código"
                  : "Reenviar código"}
          </Button>

          <div className="text-muted-foreground text-center text-sm">
            <p>El código expira en 24 horas</p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
