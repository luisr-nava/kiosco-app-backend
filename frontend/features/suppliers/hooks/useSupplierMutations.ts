import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useShopStore } from "@/features/shop/shop.store";
import { CreateSupplierDto } from "../types";
import {
  createSupplierAction,
  deleteSupplierAction,
  updateSupplierAction,
} from "../actions";

export const useSupplierCreateMutation = () => {
  const queryClient = useQueryClient();
  const { activeShopId } = useShopStore();

  return useMutation({
    mutationFn: (payload: CreateSupplierDto) => createSupplierAction(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers", activeShopId] });
    },
  });
};

export const useSupplierUpdateMutation = () => {
  const queryClient = useQueryClient();
  const { activeShopId } = useShopStore();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<CreateSupplierDto>;
    }) => updateSupplierAction(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers", activeShopId] });
    },
  });
};

export const useSupplierDeleteMutation = () => {
  const queryClient = useQueryClient();
  const { activeShopId } = useShopStore();

  return useMutation({
    mutationFn: ({ id }: { id: string }) => deleteSupplierAction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers", activeShopId] });
    },
  });
};



