import { useShopStore } from "@/features/shop/shop.store";
import { CreateExpenseDto, Expense } from "../types";
import {
  useExpenseCreateMutation,
  useExpenseDeleteMutation,
  useExpenseUpdateMutation,
} from "./useExpenseMutations";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useEffect } from "react";

const initialForm: CreateExpenseDto = {
  description: "",
  amount: undefined,
  paymentMethodId: "",
  cashRegisterId: "",
  date: null,
  shopId: "",
};

function mapExpenseToForm(
  expense: Expense,
  initialForm: CreateExpenseDto
): CreateExpenseDto {
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

export const useExpenseForm = (
  cashRegisterId: string,
  editExpense?: Expense,
  deleteExpense?: Expense,
  isEdit?: boolean,
  onClose?: () => void
) => {
  const { activeShopId } = useShopStore();

  const createMutation = useExpenseCreateMutation();
  const updateMutation = useExpenseUpdateMutation();
  const deleteMutation = useExpenseDeleteMutation();

  const form = useForm<CreateExpenseDto>({
    defaultValues: initialForm,
  });

  const onSubmit = async (values: CreateExpenseDto) => {
    const basePayload: CreateExpenseDto = {
      ...values,
      shopId: activeShopId!,
      cashRegisterId: cashRegisterId,
      amount: +values.amount!,
    };
    if (editExpense) {
      updateMutation.mutate(
        {
          id: editExpense.id,
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
    } else if (deleteExpense) {
      deleteMutation.mutate(
        {
          id: deleteExpense.id,
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

    if (editExpense) {
      form.reset(mapExpenseToForm(editExpense, initialForm));
    }
  }, [isEdit, editExpense]);

  return {
    form,
    onSubmit,
    initialForm,
    reset: form.reset,
    isLoadingCreate: createMutation.isPending,
    isLoadingUpdate: updateMutation.isPending,
    isLoadingDelete: deleteMutation.isPending,
  };
};
