import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createExpenseAction,
  updateExpenseAction,
  deleteExpenseAction,
} from "../actions";
import type { CreateExpenseDto } from "../types";
import { useShopStore } from "@/features/shop/shop.store";

export const useExpenseCreateMutation = () => {
  const queryClient = useQueryClient();
  const { activeShopId } = useShopStore();

  return useMutation({
    mutationFn: (payload: CreateExpenseDto) => createExpenseAction(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
  });
};
export const useExpenseUpdateMutation = () => {
  const queryClient = useQueryClient();
  const { activeShopId } = useShopStore();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<CreateExpenseDto>;
    }) => updateExpenseAction(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
  });
};

export const useExpenseDeleteMutation = () => {
  const queryClient = useQueryClient();
  const { activeShopId } = useShopStore();

  return useMutation({
    mutationFn: ({ id }: { id: string }) => deleteExpenseAction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
  });
};
