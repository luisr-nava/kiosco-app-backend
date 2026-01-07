import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useShopStore } from "@/features/shop/shop.store";
import { openCashRegisterAction } from "../actions";
import { OpenCashRegisterDto } from "../type";

export const useCashRegisterMutation = () => {
  const { activeShopId } = useShopStore();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: OpenCashRegisterDto) =>
      openCashRegisterAction({
        ...payload,
        shopId: activeShopId!,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["cash-register-state", activeShopId],
      });
    },
  });
};
