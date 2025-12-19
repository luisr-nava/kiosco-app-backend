import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useShopStore } from "@/app/(private)/store/shops.slice";
import {
  createExpenseAction,
  updateExpenseAction,
  deleteExpenseAction,
} from "../actions";
import type { CreateExpenseDto } from "../interfaces";
import { getErrorMessage } from "@/lib/error-handler";

export const useExpenseMutations = () => {
  const queryClient = useQueryClient();
  const { activeShopId } = useShopStore();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["expenses", activeShopId] });

  const createMutation = useMutation({
    mutationFn: (payload: CreateExpenseDto) => createExpenseAction(payload),
    onSuccess: () => {
      toast.success("Gasto creado");
      invalidate();
    },
    onError: (error: unknown) => {
      const { message } = getErrorMessage(
        error,
        "No se pudo crear el gasto",
      );
      toast.error("Error", { description: message });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<CreateExpenseDto>;
    }) => updateExpenseAction(id, payload),
    onSuccess: () => {
      toast.success("Gasto actualizado");
      invalidate();
    },
    onError: (error: unknown) => {
      const { message } = getErrorMessage(
        error,
        "No se pudo actualizar el gasto",
      );
      toast.error("Error", { description: message });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteExpenseAction(id),
    onSuccess: () => {
      toast.success("Gasto eliminado");
      invalidate();
    },
    onError: (error: unknown) => {
      const { message } = getErrorMessage(
        error,
        "No se pudo eliminar el gasto",
      );
      toast.error("Error", { description: message });
    },
  });

  return { createMutation, updateMutation, deleteMutation };
};
