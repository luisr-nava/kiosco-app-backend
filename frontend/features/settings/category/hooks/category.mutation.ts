import { useMutation, useQueryClient } from "@tanstack/react-query";

import { CreateCategorySupplierDto } from "../types";
import {
  createCategorySuppliertAction,
  updateCategorySupplierAction,
} from "../actions";
import { useShopStore } from "@/features/shop/shop.store";

export const useCategorySupplierCreateMutation = () => {
  const queryClient = useQueryClient();
  const { activeShopId } = useShopStore();
  return useMutation({
    mutationFn: (payload: CreateCategorySupplierDto) =>
      createCategorySuppliertAction(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["category-suppliers", activeShopId],
      });
      queryClient.invalidateQueries({ queryKey: ["category-suppliers"] });
    },
  });
};
export const useCategorySupplierUpdateMutation = () => {
  const queryClient = useQueryClient();
  const { activeShopId } = useShopStore();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<CreateCategorySupplierDto>;
    }) => updateCategorySupplierAction(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["category-suppliers", activeShopId],
      });
      queryClient.invalidateQueries({ queryKey: ["category-suppliers"] });
    },
  });
};
