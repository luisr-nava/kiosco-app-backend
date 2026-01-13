import { useShopStore } from "@/features/shop/shop.store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CreateCategoryProductDto } from "../types";
import {
  createCategoryProductAction,
  updateCategoryProductAction,
} from "../actions";

export const useCategoryProductCreateMutation = () => {
  const queryClient = useQueryClient();
  const { activeShopId } = useShopStore();

  return useMutation({
    mutationFn: (payload: CreateCategoryProductDto) =>
      createCategoryProductAction(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["category-products", activeShopId],
      });
      queryClient.invalidateQueries({ queryKey: ["category-products"] });
    },
  });
};

export const useCategoryProductUpdateMutation = () => {
  const queryClient = useQueryClient();
  const { activeShopId } = useShopStore();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<CreateCategoryProductDto>;
    }) => updateCategoryProductAction(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["category-products", activeShopId],
      });
      queryClient.invalidateQueries({ queryKey: ["category-products"] });
    },
  });
};
