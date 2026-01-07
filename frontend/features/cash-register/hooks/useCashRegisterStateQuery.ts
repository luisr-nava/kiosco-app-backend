import { useQuery } from "@tanstack/react-query";
import { getCashRegisterStateAction } from "../actions/get-cash-register-state.action";

export const useCashRegisterStateQuery = (shopId?: string) => {
  return useQuery({
    queryKey: ["cash-register-state", shopId],
    queryFn: () => getCashRegisterStateAction(shopId!),
    enabled: Boolean(shopId),
    staleTime: 1000 * 30,
  });
};
