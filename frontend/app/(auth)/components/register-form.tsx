"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Chrome } from "lucide-react";
import { useForm } from "react-hook-form";
import { useRegister } from "../hooks/useRegister";
import { useGoogleAuth } from "../hooks/useGoogleAuth";

interface RegisterFormData {
  fullName: string;
  email: string;
  password: string;
  verifyPassword: string;
}

export default function RegisterForm() {
  const { register: registerUser, isLoading } = useRegister();
  const googleAuth = useGoogleAuth();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      verifyPassword: "",
    },
  });

  const password = watch("password");

  const onSubmit = (data: RegisterFormData) => {
    registerUser({
      fullName: data.fullName,
      email: data.email,
      password: data.password,
      projectId: process.env.NEXT_PUBLIC_PROJECT_ID!,
    });
  };

  const handleGoogleSignIn = () => {
    googleAuth.signInWithGoogle();
  };

  return (
    <Card className="border-border/50 shadow-lg">
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Required Fields */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nombre Completo *</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Juan Pérez"
                {...register("fullName", {
                  required: "El nombre completo es requerido",
                  minLength: {
                    value: 3,
                    message: "El nombre debe tener al menos 3 caracteres",
                  },
                })}
                disabled={isLoading}
              />
              {errors.fullName && (
                <p className="text-sm text-destructive">
                  {errors.fullName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
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

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña *</Label>
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

              <div className="space-y-2">
                <Label htmlFor="verifyPassword">Verificar Contraseña *</Label>
                <PasswordInput
                  id="verifyPassword"
                  placeholder="••••••••"
                  {...register("verifyPassword", {
                    required: "Debes verificar la contraseña",
                    validate: (value) =>
                      value === password || "Las contraseñas no coinciden",
                  })}
                  disabled={isLoading}
                />
                {errors.verifyPassword && (
                  <p className="text-sm text-destructive">
                    {errors.verifyPassword.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || googleAuth.isLoading}>
            {isLoading ? "Creando cuenta..." : "Crear Cuenta"}
          </Button>

          {/* Google Sign In */}
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

