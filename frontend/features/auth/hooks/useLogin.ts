import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuthStore } from "../auth.slice";
import { LoginFormData, LoginResponse } from "../types";
import { useMemo, useState } from "react";
import { useLoginMutation } from "./useAuthMutations";

export const useLogin = () => {
  const router = useRouter();
  const savedEmail = useMemo(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("remember-email") ?? "";
  }, []);

  const [rememberMe, setRememberMe] = useState(() => Boolean(savedEmail));

  const { mutate, isPending } = useLoginMutation();
  const setAuth = useAuthStore((state) => state.setAuth);
  const onSubmit = (data: LoginFormData) => {
    if (rememberMe) {
      localStorage.setItem("remember-email", data.email);
    } else {
      localStorage.removeItem("remember-email");
    }

    mutate(
      {
        email: data.email,
        password: data.password,
      },
      {
        onSuccess: (data: LoginResponse) => {
          setAuth({
            user: data.user,
            token: data.token,
            ownerId: data.ownerId,
            plan: data.plan,
            subscriptionStatus: data.subscriptionStatus,
          });

          toast.success("¡Bienvenido!", {
            description: `Inicio de sesión exitoso. Hola, ${data.user.fullName}`,
          });

          // Redirigir al dashboard
          router.push("/dashboard");
        },
        onError: () => {
          toast.error("Credenciales incorrectas", {
            description: "El email o la contraseña son incorrectos.",
            duration: 5000,
          });
        },
      }
    );
  };

  return {
    onSubmit,
    isLoading: isPending,
    rememberMe,
    setRememberMe,
    savedEmail,
  };
};
