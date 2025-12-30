import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createShopAction } from "../actions/create.shop.action";
import { Shop, ShopFormValues } from "../types";

export const useShopMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ShopFormValues) => {
      return await createShopAction(data);
    },

    onSuccess: (newShop) => {
      queryClient.setQueryData<Shop[]>(["shops"], (old) => {
        if (!old) return [newShop];

        return [...old, newShop];
      });
    },
  });
};

