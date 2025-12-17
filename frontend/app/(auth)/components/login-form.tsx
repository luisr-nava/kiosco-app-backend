"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Chrome } from "lucide-react";
import { useForm } from "react-hook-form";
import { useLogin } from "../hooks/useLogin";
import { useGoogleAuth } from "../hooks/useGoogleAuth";
import { useMemo, useState } from "react";

interface LoginFormData {
  email: string;
  password: string;
}

const REMEMBER_EMAIL_KEY = "remember-email";

export default function LoginForm() {
  const { login, isLoading } = useLogin();
  const googleAuth = useGoogleAuth();
  const savedEmail = useMemo(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem(REMEMBER_EMAIL_KEY) ?? "";
  }, []);
  const [rememberMe, setRememberMe] = useState(() => Boolean(savedEmail));

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    defaultValues: {
      email: savedEmail,
      password: "",
    },
  });

  const onSubmit = (data: LoginFormData) => {
    // Guardar o limpiar email según checkbox
    if (rememberMe) {
      localStorage.setItem(REMEMBER_EMAIL_KEY, data.email);
    } else {
      localStorage.removeItem(REMEMBER_EMAIL_KEY);
    }

    login({
      email: data.email,
      password: data.password,
    });
  };

  const handleGoogleSignIn = () => {
    googleAuth.signInWithGoogle();
  };
  return (
    <Card className=" shadow-lg w-md ">
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="juan@example.com"
                {...register("email", {
                  required: "El email es requerido",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Ingresa un email válido",
                  },
                })}
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-sm text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Contraseña</Label>
                <a
                  href="/forgot-password"
                  className="text-sm text-violet-900 font-semibold transition-all duration-300 hover:text-violet-800">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
              <PasswordInput
                id="password"
                placeholder="••••••••"
                {...register("password", {
                  required: "La contraseña es requerida",
                  minLength: {
                    value: 6,
                    message: "La contraseña debe tener al menos 6 caracteres",
                  },
                })}
                disabled={isLoading}
              />
              {errors.password && (
                <p className="text-sm text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="remember"
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked === true)}
              disabled={isLoading}
            />
            <label
              htmlFor="remember"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
              Recordarme
            </label>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || googleAuth.isLoading}
          >
            {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">O</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogleSignIn}
            disabled={isLoading || googleAuth.isLoading}>
            <Chrome className="mr-2 h-4 w-4" />
            {googleAuth.isLoading
              ? "Redirigiendo a Google..."
              : "Continuar con Google"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
