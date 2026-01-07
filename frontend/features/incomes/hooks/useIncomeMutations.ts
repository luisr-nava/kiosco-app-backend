import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createIncomeAction, updateIncomeAction, deleteIncomeAction } from "../actions";
import type { CreateIncomeDto } from "../types";
import { useShopStore } from "@/features/shop/shop.store";

export const useIncomeCreateMutation = () => {
  const queryClient = useQueryClient();
  const { activeShopId } = useShopStore();

  return useMutation({
    mutationFn: (payload: CreateIncomeDto) => createIncomeAction(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incomes", activeShopId] });
    },
  });
};

export const useIncomeUpdateMutation = () => {
  const queryClient = useQueryClient();
  const { activeShopId } = useShopStore();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateIncomeDto> }) =>
      createIncomeAction(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incomes", activeShopId] });
    },
  });
};

export const useIncomeDeleteMutation = () => {
  const queryClient = useQueryClient();
  const { activeShopId } = useShopStore();

  return useMutation({
    mutationFn: ({ id }: { id: string }) => deleteIncomeAction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incomes", activeShopId] });
    },
  });
};
