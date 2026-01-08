import { useShopStore } from "@/features/shop/shop.store";
import { CreateIncomeDto, Income } from "../types";
import { useForm } from "react-hook-form";
import {
  useIncomeCreateMutation,
  useIncomeDeleteMutation,
  useIncomeUpdateMutation,
} from "./useIncomeMutations";
import { toast } from "sonner";
import { useEffect } from "react";

const initialForm: CreateIncomeDto = {
  description: "",
  amount: undefined,
  paymentMethodId: "",
  cashRegisterId: "",
  date: null,
  shopId: "",
};

function mapIncomeToForm(
  expense: Income,
  initialForm: CreateIncomeDto
): CreateIncomeDto {
  return {
    ...initialForm,
    amount: expense.amount,
    paymentMethodId: expense.paymentMethodId
      ? String(expense.paymentMethodId)
      : "",
    date: expense.date ? expense.date.split("T")[0] : "",
    description: expense.description,
  };
}

export const useIncomeForm = (
  cashRegisterId: string,
  editIncome?: Income,
  deleteIncome?: Income,
  isEdit?: boolean,
  onClose?: () => void
) => {
  const { activeShopId } = useShopStore();

  const createMutation = useIncomeCreateMutation();
  const updateMutation = useIncomeUpdateMutation();
  const deleteMutation = useIncomeDeleteMutation();

  const form = useForm<CreateIncomeDto>({
    defaultValues: initialForm,
  });

  const onSubmit = async (values: CreateIncomeDto) => {
    const basePayload: CreateIncomeDto = {
      ...values,
      shopId: activeShopId!,
      cashRegisterId: cashRegisterId,
      amount: +values.amount!,
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
            onClose?.();
            form.reset({ ...initialForm });
          },
          onError: () => {
            toast.error("No se pudo actualizar el cliente");
          },
        }
      );
    } else if (deleteIncome) {
      deleteMutation.mutate(
        {
          id: deleteIncome.id,
        },
        {
          onSuccess: () => {
            toast.success("Gasto eliminado correctamente");
            onClose?.();
            form.reset({ ...initialForm });
          },
          onError: () => {
            toast.error("No se pudo eliminar el gasto");
          },
        }
      );
    } else {
      createMutation.mutate(basePayload, {
        onSuccess: () => {
          toast.success("Gasto creado");
          onClose?.();
          form.reset({ ...initialForm });
        },
        onError: () => {
          toast.error("No se pudo crear el gasto");
        },
      });
    }
  };
  useEffect(() => {
    if (!isEdit) {
      form.reset(initialForm);
      return;
    }

    if (editIncome) {
      form.reset(mapIncomeToForm(editIncome, initialForm));
    }
  }, [isEdit, editIncome]);

  return {
    form,
    activeShopId,
    createMutation,
    updateMutation,
    deleteMutation,
    isLoadingCreate: createMutation.isPending,
    isLoadingUpdate: updateMutation.isPending,
    isLoadingDelete: deleteMutation.isPending,
    reset: form.reset,
    onSubmit,
    initialForm,
  };
};
