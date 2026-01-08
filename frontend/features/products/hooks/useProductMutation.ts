import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CreateProductDto } from "../types";
import { createProductAction } from "../actions/create.product.action";
import { updateProductAction } from "../actions/update.product.action";
import { useShopStore } from "@/features/shop/shop.store";

export const usePoductCreateMutation = () => {
  const queryClient = useQueryClient();
  const { activeShopId } = useShopStore();

  return useMutation({
    mutationFn: (payload: CreateProductDto) => createProductAction(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products", activeShopId] });
    },
  });
};

export const useProductUpdateMutation = () => {
  const queryClient = useQueryClient();
  const { activeShopId } = useShopStore();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<CreateProductDto>;
    }) => updateProductAction(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products", activeShopId] });
    },
  });
};
