import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getAuthErrorMessage } from "@/lib/error-handler";
import { RegisterFormData, RegisterResponse } from "../types";
import { useRegisterMutation } from "./useAuthMutations";

export const useRegister = () => {
  const router = useRouter();
  const { mutate, isPending } = useRegisterMutation();

  const onSubmit = (data: RegisterFormData) => {
    mutate(
      {
        fullName: data.fullName,
        email: data.email,
        password: data.password,
      },
      {
        onSuccess: () => {
          toast.success("¡Cuenta creada exitosamente!", {
            description:
              "Te hemos enviado un código de verificación de 6 dígitos a tu email.",
            duration: 5000,
          });

          setTimeout(() => {
            router.push("/verify-account");
          }, 1500);
        },
        onError: (error: unknown) => {
          toast.error("Error al registrar", {
            description: getAuthErrorMessage(error).message,
            duration: 5000,
          });
        },
      }
    );
  };
  // const mutation = useMutation({
  //   mutationFn: async ({
  //     fullName,
  //     email,
  //     password,
  //   }: {
  //     fullName: string;
  //     email: string;
  //     password: string;
  //   }) => {
  //     return await registerAction({ fullName, email, password });
  //   },
  //   onSuccess: () => {
  //     // Toast de éxito
  //     toast.success("¡Cuenta creada exitosamente!", {
  //       description:
  //         "Te hemos enviado un código de verificación de 6 dígitos a tu email.",
  //       duration: 5000,
  //     });

  //     setTimeout(() => {
  //       router.push("/verify-account");
  //     }, 1500);
  //   },
  //   onError: (error: unknown) => {
  //     // Obtener mensaje de error usando el helper centralizado
  //     const { title, message } = getAuthErrorMessage(error);

  //     toast.error(title, {
  //       description: message,
  //       duration: 5000,
  //     });
  //   },
  // });

  return {
    onSubmit,
    isLoading: isPending,
  };
};
