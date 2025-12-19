import { useQuery } from "@tanstack/react-query";
import { useShopStore } from "@/app/(private)/store/shops.slice";
import { getPaymentMethodsAction } from "../actions";

export const usePaymentMethods = () => {
  const { activeShopId } = useShopStore();

  const query = useQuery({
    queryKey: ["payment-methods", activeShopId],
    queryFn: () => getPaymentMethodsAction(activeShopId || ""),
    enabled: Boolean(activeShopId),
    staleTime: 1000 * 30,
    placeholderData: (prev) => prev,
  });

  return {
    paymentMethods: query.data?.paymentMethods || [],
    pagination: query.data?.pagination,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
  };
};
