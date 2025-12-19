import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useShopStore } from "@/app/(private)/store/shops.slice";
import {
  createPaymentMethodAction,
  deletePaymentMethodAction,
  updatePaymentMethodAction,
} from "../actions";
import type { CreatePaymentMethodDto } from "../interfaces";
import { getErrorMessage } from "@/lib/error-handler";

export const usePaymentMethodMutations = () => {
  const queryClient = useQueryClient();
  const { activeShopId } = useShopStore();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["payment-methods", activeShopId] });

  const createMutation = useMutation({
    mutationFn: (payload: CreatePaymentMethodDto) =>
      createPaymentMethodAction(payload),
    onSuccess: () => {
      toast.success("Método de pago creado");
      invalidate();
    },
    onError: (error: unknown) => {
      const { message } = getErrorMessage(
        error,
        "No se pudo crear el método de pago",
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
      payload: Partial<CreatePaymentMethodDto>;
    }) => updatePaymentMethodAction(id, payload),
    onSuccess: () => {
      toast.success("Método de pago actualizado");
      invalidate();
    },
    onError: (error: unknown) => {
      const { message } = getErrorMessage(
        error,
        "No se pudo actualizar el método de pago",
      );
      toast.error("Error", { description: message });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deletePaymentMethodAction(id),
    onSuccess: () => {
      toast.success("Método de pago eliminado");
      invalidate();
    },
    onError: (error: unknown) => {
      const { message } = getErrorMessage(
        error,
        "No se pudo eliminar el método de pago",
      );
      toast.error("Error", { description: message });
    },
  });

  return { createMutation, updateMutation, deleteMutation };
};
