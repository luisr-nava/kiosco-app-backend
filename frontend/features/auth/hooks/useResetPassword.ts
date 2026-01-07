import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { resetPasswordAction } from "../actions/reset.password.action";
import { useResetPasswordMutation } from "./useAuthMutations";

export const useResetPassword = ({ token }: { token: string }) => {
  const router = useRouter();
  const { mutate, isPending } = useResetPasswordMutation();

  const onSubmit = (data: { password: string }) => {
    mutate(
      {
        token,
        newPassword: data.password,
      },
      {
        onSuccess: () => {
          toast.success("¡Contraseña restablecida!", {
            description:
              "Tu contraseña ha sido actualizada correctamente. Ahora puedes iniciar sesión con tu nueva contraseña.",
            duration: 5000,
          });

          // Redirigir al login
          setTimeout(() => {
            router.push("/login");
          }, 1500);
        },
        onError: () => {
          toast.error("Error al restablecer contraseña", {
            description: "No se pudo restablecer la contraseña. Por favor intenta de nuevo.",
            duration: 5000,
          });
        },
      }
    );
    localStorage.removeItem("remember-email");
  };

  return {
    onSubmit,
    isPending,
  };
};
