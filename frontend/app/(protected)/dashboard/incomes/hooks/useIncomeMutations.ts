import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createIncomeAction,
  updateIncomeAction,
  deleteIncomeAction,
} from "../actions";
import type { CreateIncomeDto } from "../interfaces";
import { useShopStore } from "@/features/shop/shop.store";

export const useIncomeMutations = () => {
  const queryClient = useQueryClient();
  const { activeShopId } = useShopStore();

  const createMutation = useMutation({
    mutationFn: (payload: CreateIncomeDto) => createIncomeAction(payload),
    onSuccess: () => {
      toast.success("Ingreso creado");
      queryClient.invalidateQueries({ queryKey: ["incomes", activeShopId] });
    },
    onError: () => {
      toast.error("No se pudo crear el ingreso");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<CreateIncomeDto>;
    }) => updateIncomeAction(id, payload),
    onSuccess: () => {
      toast.success("Ingreso actualizado");
      queryClient.invalidateQueries({ queryKey: ["incomes", activeShopId] });
    },
    onError: () => {
      toast.error("No se pudo actualizar el ingreso");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteIncomeAction(id),
    onSuccess: () => {
      toast.success("Ingreso eliminado");
      queryClient.invalidateQueries({ queryKey: ["incomes", activeShopId] });
    },
    onError: () => {
      toast.error("No se pudo eliminar el ingreso");
    },
  });

  return { createMutation, updateMutation, deleteMutation };
};

