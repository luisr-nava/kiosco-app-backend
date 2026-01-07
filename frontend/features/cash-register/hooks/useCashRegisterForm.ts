import { toast } from "sonner";
import { useCashRegisterMutation } from "./useCashRegisterMutation";
import { OpenCashRegisterDto } from "@/lib/types/cash-register";
import { useForm } from "react-hook-form";

const initialForm: OpenCashRegisterDto = {
  openedByName: "",
  openingAmount: undefined,
};

export const useCashRegisterForm = (onClose?: () => void) => {
  const createMutation = useCashRegisterMutation();

  const { register, handleSubmit, reset, setValue, getValues, control } =
    useForm<OpenCashRegisterDto>({
      defaultValues: initialForm,
      mode: "onChange",
    });

  const onSubmit = handleSubmit((values) => {
    createMutation.mutate(values, {
      onSuccess: () => {
        toast.success("Caja abierta correctamente");
        onClose?.();
        reset();
      },
      onError: () => {
        toast.error("No se pudo abrir la caja");
      },
    });
  });

  return {
    createMutation,
    isLoadingCreate: createMutation.isPending,
    register,
    reset,
    onSubmit,
    setValue,
  };
};
