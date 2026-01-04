import { useShopStore } from "@/features/shop/shop.store";
import { CreateIncomeDto, Income } from "../types";
import { useForm } from "react-hook-form";
import {
  useIncomeCreateMutation,
  useIncomeDeleteMutation,
  useIncomeUpdateMutation,
} from "./useIncomeMutations";
import { toast } from "sonner";

const initialForm: CreateIncomeDto = {
  description: "",
  amount: 0,
  paymentMethodId: "",
  cashRegisterId: "",
  date: "",
  shopId: "",
};

export const useIncomeForm = (
  editIncome?: Income,
  deleteIncome?: Income,
  onClose?: () => void,
) => {
  const { activeShopId } = useShopStore();

  const createMutation = useIncomeCreateMutation();
  const updateMutation = useIncomeUpdateMutation();
  const deleteMutation = useIncomeDeleteMutation();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    control,
    formState: { errors, isValid },
  } = useForm<CreateIncomeDto>({
    defaultValues: initialForm,
    mode: "onChange",
  });

  const onSubmit = handleSubmit((values) => {
    const basePayload: CreateIncomeDto = {
      ...values,
      shopId: activeShopId!,
    };
    if (editIncome) {
      updateMutation.mutate(
        {
          id: editIncome.id,
          payload: basePayload,
        },
        {
          onSuccess: () => {
            toast.success("Gasto actualizado");
          },
          onError: () => {
            toast.error("No se pudo actualizar el cliente");
          },
        },
      );
    } else if (deleteIncome) {
      deleteMutation.mutate(
        {
          id: deleteIncome.id,
        },
        {
          onSuccess: () => {
            toast.success("Gasto eliminado correctamente");
          },
          onError: () => {
            toast.error("No se pudo eliminar el gasto");
          },
        },
      );
    } else {
      createMutation.mutate(basePayload, {
        onSuccess: () => {
          toast.success("Gasto creado");
        },
        onError: () => {
          toast.error("No se pudo crear el gasto");
        },
      });
    }
    onClose?.();
    reset();
  });

  return {
    activeShopId,
    createMutation,
    updateMutation,
    deleteMutation,
    isLoadingCreate: createMutation.isPending,
    isLoadingUpdate: updateMutation.isPending,
    isLoadingDelete: deleteMutation.isPending,
    register,
    reset,
    onSubmit,
    initialForm,
    setValue,
    isValid,
    control,
    getValues,
    errors,
  };
};

